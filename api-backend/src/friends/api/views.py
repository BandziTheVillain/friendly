from rest_framework import generics, views, response, permissions
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .. import services
from .serializers import FriendSerializer

User = get_user_model()


def with_people_fields(qs):
    return qs.select_related("profile").annotate(friends_count=Count("friendships", distinct=True))


class SuggestedFriendsAPIView(generics.ListAPIView):
    serializer_class = FriendSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return with_people_fields(services.suggested_friends(self.request.user)).order_by("-date_joined")


class UserSearchAPIView(generics.ListAPIView):
    """GET /api/users/search/?q=<text> -> people whose name or username matches every word of q"""
    serializer_class = FriendSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        terms = self.request.GET.get("q", "").split()
        if not terms:
            return User.objects.none()

        qs = User.objects.exclude(pk=self.request.user.pk)
        # every word has to match somewhere, so "jane doe" finds Jane Doe
        for term in terms:
            qs = qs.filter(
                Q(username__icontains=term) | Q(first_name__icontains=term) | Q(last_name__icontains=term)
            )
        return with_people_fields(qs).order_by("first_name", "last_name", "username")


class FriendListAPIView(generics.ListAPIView):
    """GET /api/users/<username>/friends/"""
    serializer_class = FriendSerializer

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs["username"])
        return with_people_fields(services.friends_of(user)).order_by("first_name", "last_name")


class RelationshipAPIView(views.APIView):
    """GET /api/users/<username>/relationship/ -> {"relationship": "friends" | ...}"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, username, *args, **kwargs):
        other = get_object_or_404(User, username=username)
        return response.Response({"relationship": services.relationship(request.user, other)})


class UnfriendAPIView(views.APIView):
    """DELETE /api/friends/<user_id>/"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, user_id, *args, **kwargs):
        other = get_object_or_404(User, pk=user_id)
        services.unfriend(request.user, other)
        return response.Response(status=204)
