from rest_framework import serializers
from django.contrib.auth import get_user_model

from ..services import RelationshipIndex

User = get_user_model()

class FriendSerializer(serializers.ModelSerializer):
    """
    A user as seen by the requesting user. Querysets must be annotated with
    `friends_count` (see friends.api.views.with_people_fields).
    """
    avatar = serializers.ImageField(source="profile.avatar", read_only=True, use_url=True)
    friends_count = serializers.IntegerField(read_only=True)
    relationship = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "username",
            "avatar",
            "friends_count",
            "relationship",
        )

    def get_relationship(self, obj):
        # built once per response and shared by every row (context is shared in list serializers)
        if "relationship_index" not in self.context:
            request = self.context.get("request")
            self.context["relationship_index"] = RelationshipIndex(getattr(request, "user", None))
        return self.context["relationship_index"].of(obj)
