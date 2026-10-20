from rest_framework import serializers
from ..models import Post, Like, Comment
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthorSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(read_only=True, source="profile.avatar")
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "avatar",
        )
      
class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True, many=False)
    
    class Meta:
        model = Post
        fields = ["id", "author", "text", "image", "date_created", "like_count", "comment_count"]
        
class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = "__all__"
        
class CommentSerializer(serializers.ModelSerializer):
    user = AuthorSerializer(read_only=True, many=False)
    class Meta:
        model = Comment
        fields = ["id", "text", "user", "post", "date_created"]