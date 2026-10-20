import uuid

from django.db import models

from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.
class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.TextField(max_length=255)
    image = models.ImageField(upload_to="posts/img", blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    date_created = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "posts"
        ordering = ["-date_created"]
        
    @property
    def like_count(self):
        return len(self.likes.all())
    
    @property
    def comment_count(self):
        return len(self.comments.all())
        
class Like(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_likes")
    
    class Meta:
        db_table = "likes"
        constraints = [
            models.UniqueConstraint(
                fields=["post", "user"],
                name="unique_like"
            )
        ]
    
class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.TextField(max_length=255)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_comments")
    date_created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "comments"
    
    