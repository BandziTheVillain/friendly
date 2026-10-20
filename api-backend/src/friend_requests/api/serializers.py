from rest_framework import serializers
from ..models import FriendRequest

from users.api.serializers import UserSerializer

class FriendRequestSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True, many=False)
    recepient = UserSerializer(read_only=True, many=False)
    
    class Meta:
        model = FriendRequest
        fields = "__all__"