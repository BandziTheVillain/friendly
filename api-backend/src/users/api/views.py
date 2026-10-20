from rest_framework import generics
from .serializers import UserSerializer, User

class UserListAPIView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer