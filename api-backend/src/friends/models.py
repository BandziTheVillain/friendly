import uuid

from django.db import models
from django.db.models import F, Q
from django.contrib.auth import get_user_model

User = get_user_model()


class Friendship(models.Model):
    """
    A directed edge: `user` is friends with `friend`.
    Every friendship is stored as two rows (A -> B and B -> A), always written
    and deleted together by friends.services, so "A's friends" is a single filter.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships")
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friend_of")
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} -> {self.friend}"

    class Meta:
        db_table = "friendships"
        constraints = [
            models.UniqueConstraint(fields=("user", "friend"), name="unique_friendship"),
            models.CheckConstraint(condition=~Q(user=F("friend")), name="no_self_friendship"),
        ]
