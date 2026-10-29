"""
All friendship rules live here. Views only call these functions; the DRF
exceptions raised below are turned into the matching HTTP responses.
"""
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.db.models import Q
from rest_framework import status
from rest_framework.exceptions import APIException, NotFound, PermissionDenied, ValidationError

from friend_requests.models import FriendRequest, FRStatus
from .models import Friendship

User = get_user_model()


class Conflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Conflict."
    default_code = "conflict"


class Relationship:
    SELF = "self"
    FRIENDS = "friends"
    REQUEST_SENT = "request_sent"
    REQUEST_RECEIVED = "request_received"
    NONE = "none"


def are_friends(user, other) -> bool:
    return Friendship.objects.filter(user=user, friend=other).exists()


def friends_of(user):
    return User.objects.filter(friend_of__user=user)


def _make_friends(a, b):
    """Create both friendship rows and close any pending requests between the pair."""
    Friendship.objects.bulk_create(
        [Friendship(user=a, friend=b), Friendship(user=b, friend=a)],
        ignore_conflicts=True,
    )
    for sender, recipient in ((a, b), (b, a)):
        FriendRequest.objects.filter(
            sender=sender, recepient=recipient, status=FRStatus.PENDING
        ).update(status=FRStatus.ACCEPTED)


def _get_pending_request(request_id):
    friend_request = (
        FriendRequest.objects.select_for_update()
        .select_related("sender", "recepient")
        .filter(pk=request_id)
        .first()
    )
    if friend_request is None:
        raise NotFound("Friend request not found.")
    if friend_request.status != FRStatus.PENDING:
        raise Conflict(f"Friend request was already {friend_request.status.lower()}.")
    return friend_request


@transaction.atomic
def send_request(sender, recipient) -> FriendRequest:
    """
    Send a friend request. If `recipient` already sent one to `sender`,
    that request is accepted instead (returned with status Accepted).
    """
    if sender.pk == recipient.pk:
        raise ValidationError({"detail": "You can't send a friend request to yourself."})
    if are_friends(sender, recipient):
        raise Conflict("You are already friends.")
    if FriendRequest.objects.filter(sender=sender, recepient=recipient, status=FRStatus.PENDING).exists():
        raise Conflict("Friend request already sent.")

    incoming = (
        FriendRequest.objects.select_for_update()
        .filter(sender=recipient, recepient=sender, status=FRStatus.PENDING)
        .first()
    )
    if incoming:
        _make_friends(sender, recipient)
        incoming.refresh_from_db()
        return incoming

    try:
        with transaction.atomic():
            return FriendRequest.objects.create(sender=sender, recepient=recipient)
    except IntegrityError:
        # a concurrent identical request won the race on the unique pending constraint
        raise Conflict("Friend request already sent.")


@transaction.atomic
def accept_request(request_id, user) -> FriendRequest:
    friend_request = _get_pending_request(request_id)
    if friend_request.recepient_id != user.pk:
        raise PermissionDenied("Only the recipient can accept this friend request.")
    _make_friends(friend_request.sender, friend_request.recepient)
    friend_request.refresh_from_db()
    return friend_request


@transaction.atomic
def decline_request(request_id, user) -> FriendRequest:
    friend_request = _get_pending_request(request_id)
    if friend_request.recepient_id != user.pk:
        raise PermissionDenied("Only the recipient can decline this friend request.")
    friend_request.status = FRStatus.DECLINED
    friend_request.save(update_fields=["status"])
    return friend_request


@transaction.atomic
def cancel_request(request_id, user) -> None:
    friend_request = _get_pending_request(request_id)
    if friend_request.sender_id != user.pk:
        raise PermissionDenied("Only the sender can cancel this friend request.")
    friend_request.delete()


@transaction.atomic
def unfriend(user, other) -> None:
    deleted, _ = Friendship.objects.filter(
        Q(user=user, friend=other) | Q(user=other, friend=user)
    ).delete()
    if not deleted:
        raise NotFound("You are not friends.")


def suggested_friends(user):
    """Everyone except the user, their friends, and anyone with a pending request either way."""
    pending = FriendRequest.objects.filter(status=FRStatus.PENDING)
    return User.objects.exclude(pk=user.pk).exclude(
        pk__in=Friendship.objects.filter(user=user).values("friend")
    ).exclude(
        pk__in=pending.filter(sender=user).values("recepient")
    ).exclude(
        pk__in=pending.filter(recepient=user).values("sender")
    )


class RelationshipIndex:
    """
    Answers relationship(viewer, other) for many `other`s with three queries total,
    so list endpoints don't do per-row lookups.
    """
    def __init__(self, viewer):
        self.viewer = viewer
        if viewer is None or not viewer.is_authenticated:
            self.friend_ids = self.sent_ids = self.received_ids = frozenset()
            return
        pending = FriendRequest.objects.filter(status=FRStatus.PENDING)
        self.friend_ids = set(Friendship.objects.filter(user=viewer).values_list("friend_id", flat=True))
        self.sent_ids = set(pending.filter(sender=viewer).values_list("recepient_id", flat=True))
        self.received_ids = set(pending.filter(recepient=viewer).values_list("sender_id", flat=True))

    def of(self, other) -> str:
        if self.viewer is not None and self.viewer.pk == other.pk:
            return Relationship.SELF
        if other.pk in self.friend_ids:
            return Relationship.FRIENDS
        if other.pk in self.sent_ids:
            return Relationship.REQUEST_SENT
        if other.pk in self.received_ids:
            return Relationship.REQUEST_RECEIVED
        return Relationship.NONE


def relationship(viewer, other) -> str:
    return RelationshipIndex(viewer).of(other)


def pending_request_between(viewer, other):
    """The pending request in either direction, or None (there can be at most one per direction)."""
    if viewer is None or not viewer.is_authenticated:
        return None
    return FriendRequest.objects.filter(
        Q(sender=viewer, recepient=other) | Q(sender=other, recepient=viewer),
        status=FRStatus.PENDING,
    ).first()
