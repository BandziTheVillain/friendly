from .views import (
    FriendRequestListCreateAPIView,
    CancelFriendRequestAPIView,
    AcceptFriendRequestAPIView,
    DeclineFriendRequestAPIView,
)
from django.urls import path

urlpatterns = [
    path("friend-requests/", FriendRequestListCreateAPIView.as_view()),
    path("friend-requests/<uuid:pk>/", CancelFriendRequestAPIView.as_view()),
    path("friend-requests/<uuid:pk>/accept/", AcceptFriendRequestAPIView.as_view()),
    path("friend-requests/<uuid:pk>/decline/", DeclineFriendRequestAPIView.as_view()),
]
