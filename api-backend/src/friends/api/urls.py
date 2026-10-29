from .views import (
    FriendListAPIView,
    RelationshipAPIView,
    SuggestedFriendsAPIView,
    UnfriendAPIView,
    UserSearchAPIView,
    )
from django.urls import path

urlpatterns = [
    path("friends/suggested/", SuggestedFriendsAPIView.as_view()),
    path("users/search/", UserSearchAPIView.as_view()),
    path("friends/<uuid:user_id>/", UnfriendAPIView.as_view()),
    path("users/<str:username>/friends/", FriendListAPIView.as_view()),
    path("users/<str:username>/relationship/", RelationshipAPIView.as_view()),
]
