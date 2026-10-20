from rest_framework import generics
from .serializers import (
    Profile,
    ProfileSerializer,
    ProfileDetailSerializer,
)
from .permissions import IsProfileUserOrReadOnly

class ProfileListAPIView(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

class ProfileRudAPIView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsProfileUserOrReadOnly]
    lookup_field = "user__pk"
    lookup_url_kwarg = "uid"
    
    def get_object(self, uid=None):
        return Profile.objects.get(user__pk=uid)

class ProfileByUsernameAPIView(generics.RetrieveAPIView):
    """GET /api/profiles/<username>/ -> profile + the viewer's relationship to its owner"""
    queryset = Profile.objects.select_related("user")
    serializer_class = ProfileDetailSerializer
    lookup_field = "user__username"
    lookup_url_kwarg = "username"
