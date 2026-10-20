from django.db.models.signals import post_save
from .models import Profile
from django.contrib.auth import get_user_model

User = get_user_model()

def create_user_profile(sender, instance, created, *args, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        
post_save.connect(create_user_profile, sender=User)