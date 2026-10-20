import uuid

from django.db import models
from django.db.models.functions import Coalesce

from django.contrib.auth import get_user_model

User = get_user_model()


class PostQuerySet(models.QuerySet):
    def with_feed_fields(self):
        """Everything PostSerializer reads, in one query (counts are subqueries so they don't multiply)."""
        likes = Like.objects.filter(post=models.OuterRef("pk")).values("post").annotate(n=models.Count("pk")).values("n")
        comments = Comment.objects.filter(post=models.OuterRef("pk")).values("post").annotate(n=models.Count("pk")).values("n")
        return self.select_related("author__profile").annotate(
            _like_count=Coalesce(models.Subquery(likes), 0),
            _comment_count=Coalesce(models.Subquery(comments), 0),
        )


# Create your models here.
class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.TextField(max_length=255)
    image = models.ImageField(upload_to="posts/img", blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    date_created = models.DateTimeField(auto_now_add=True)

    objects = PostQuerySet.as_manager()

    class Meta:
        db_table = "posts"
        ordering = ["-date_created"]

    # use the with_feed_fields() annotations when present, so lists don't query per post
    @property
    def like_count(self):
        if hasattr(self, "_like_count"):
            return self._like_count
        return self.likes.count()

    @property
    def comment_count(self):
        if hasattr(self, "_comment_count"):
            return self._comment_count
        return self.comments.count()
        
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
    
    