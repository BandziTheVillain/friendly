import uuid

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.
class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(upload_to="profiles/avatars", blank=True, default="default.png")
    cover_img = models.ImageField(upload_to="profiles/cover-img", blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    
    class Meta:
        db_table = "profiles"
        
    @property
    def friends_count(self) -> int:
        return self.user.friendships.count()