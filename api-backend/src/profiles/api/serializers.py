from rest_framework import serializers
from ..models import Profile
from friends import services

from django.contrib.auth import get_user_model

User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):
    date_joined = serializers.CharField(source="user.date_joined", read_only=True)
    first_name = serializers.CharField(source="user.first_name", max_length=150, allow_blank=True, required=False)
    last_name = serializers.CharField(source="user.last_name", max_length=150, allow_blank=True, required=False)
    friends_count = serializers.IntegerField(read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "avatar",
            "bio",
            "friends_count",
            "cover_img",
            "first_name",
            "last_name",
            "user",
            "username",
            "date_joined",
        )
        read_only_fields = ("user",)

    def update(self, instance, validated_data):
        # first/last name live on the User; DRF won't write dotted sources by itself
        user_data = validated_data.pop("user", {})
        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save(update_fields=list(user_data))
        return super().update(instance, validated_data)


class ProfileDetailSerializer(ProfileSerializer):
    """A profile as seen by the requesting user, with what the friend button needs."""
    relationship = serializers.SerializerMethodField()
    friend_request_id = serializers.SerializerMethodField()

    class Meta(ProfileSerializer.Meta):
        fields = ProfileSerializer.Meta.fields + ("relationship", "friend_request_id")

    def _viewer(self):
        request = self.context.get("request")
        return getattr(request, "user", None)

    def get_relationship(self, obj):
        return services.relationship(self._viewer(), obj.user)

    def get_friend_request_id(self, obj):
        friend_request = services.pending_request_between(self._viewer(), obj.user)
        return friend_request.pk if friend_request else None
