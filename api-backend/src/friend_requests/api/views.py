from rest_framework import views, generics, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from friends import services
from ..models import FriendRequest, FRStatus
from .serializers import FriendRequestSerializer

User = get_user_model()


class FriendRequestListCreateAPIView(generics.ListCreateAPIView):
    """
    GET  /api/friend-requests/?box=incoming|outgoing   pending requests of the current user
    POST /api/friend-requests/  {"recipient": "<username>"}
    """
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        box = self.request.query_params.get("box", "incoming")
        qs = FriendRequest.objects.filter(status=FRStatus.PENDING).select_related(
            "sender__profile", "recepient__profile"
        )
        if box == "incoming":
            qs = qs.filter(recepient=self.request.user)
        elif box == "outgoing":
            qs = qs.filter(sender=self.request.user)
        else:
            raise ValidationError({"box": "Must be 'incoming' or 'outgoing'."})
        return qs.order_by("-date_created")

    def create(self, request, *args, **kwargs):
        username = request.data.get("recipient")
        if not username:
            raise ValidationError({"recipient": "This field is required."})
        recipient = get_object_or_404(User, username=username)
        friend_request = services.send_request(request.user, recipient)
        return Response(FriendRequestSerializer(friend_request).data, status=201)


class CancelFriendRequestAPIView(views.APIView):
    """DELETE /api/friend-requests/<id>/  (sender only)"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        services.cancel_request(pk, request.user)
        return Response(status=204)


class AcceptFriendRequestAPIView(views.APIView):
    """POST /api/friend-requests/<id>/accept/  (recipient only)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        friend_request = services.accept_request(pk, request.user)
        return Response(FriendRequestSerializer(friend_request).data, status=200)


class DeclineFriendRequestAPIView(views.APIView):
    """POST /api/friend-requests/<id>/decline/  (recipient only)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        friend_request = services.decline_request(pk, request.user)
        return Response(FriendRequestSerializer(friend_request).data, status=200)
