import uuid

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class FRStatus(models.TextChoices):
    PENDING = "Pending", "Pending"
    ACCEPTED = "Accepted", "Accepted"
    DECLINED = "Declined", "Declined"

# Create your models here.
class FriendRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_requests")
    recepient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_requests")
    date_created = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, blank=True, choices=FRStatus.choices, default=FRStatus.PENDING)
    
    class Meta:
        db_table = "friend_requests"
        constraints = [
            # only one *pending* request per pair, so people can re-request after a decline/unfriend
            models.UniqueConstraint(
                fields=("sender", "recepient"),
                condition=models.Q(status=FRStatus.PENDING),
                name="unique_pending_friend_request",
            )
        ]