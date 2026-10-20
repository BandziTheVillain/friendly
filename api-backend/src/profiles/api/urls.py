from django.urls import path
from .views import ProfileRudAPIView, ProfileListAPIView, ProfileByUsernameAPIView

urlpatterns = [
    path("profiles/", ProfileListAPIView.as_view()),
    path("profiles/user/<str:uid>", ProfileRudAPIView.as_view()),
    path("profiles/<str:username>/", ProfileByUsernameAPIView.as_view()),
]
