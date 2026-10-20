from .views import UserTimelineAPIView
from django.urls import path

urlpatterns = [
    path("timeline", UserTimelineAPIView.as_view())
]