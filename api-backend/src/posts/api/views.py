from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .serializers import (
    Post, PostSerializer,
    Like, LikeSerializer, 
    Comment, CommentSerializer,
    )
from .permissions import IsPostAuthorOrReadonly

class CommentViewset(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        qs = self.queryset
        
        post_id = self.request.GET.get("post_id", None)
        username = self.request.GET.get("author", None)
        
        if post_id:
            qs = qs.filter(post__pk=post_id)
        if username:
            qs = qs.filter(author__username=username)
        return qs
    
    def perform_create(self, serializer):
        return serializer.save(user=self.request.user)

class PostViewset(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = (IsPostAuthorOrReadonly,)
    
    @action(methods=["POST"], detail=True)
    def like(self, request, id=None, *args, **kwargs):
        post = self.get_object()
        
        if post.likes.filter(user=self.request.user).first():
            like=Like.objects.filter(user=self.request.user, post=post).delete()
            return Response(data={"detail": "You have unliked this post", "like": None}, status=202)
        else:
            like = Like.objects.create(post=post, user=self.request.user)
            like_serializer = LikeSerializer(instance=like, many=False)
            return Response(data={"detail": "You have liked this post", "like": like_serializer.data}, status=201)
    
    def perform_create(self, serializer):
        return serializer.save(author=self.request.user)
    
class LikeViewset(viewsets.ReadOnlyModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    
    def get_queryset(self):
        qs = self.queryset
        
        post_id = self.request.GET.get("post_id", None)
        username = self.request.GET.get("user", None)
        
        if post_id:
            qs = qs.filter(post__pk=post_id)
        if username:
            qs = qs.filter(user__username=username)
        return qs