from .views import UserListAPIView
from django.urls import path

urlpatterns = [
    path("users/", UserListAPIView.as_view())
]