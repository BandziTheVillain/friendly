from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import IntegrityError
from .serializers import (
    Post, PostSerializer,
    Like, LikeSerializer,
    Comment, CommentSerializer,
    )
from .permissions import IsPostAuthorOrReadonly, IsCommentAuthorOrReadonly

class CommentViewset(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related("user__profile").order_by("date_created")
    serializer_class = CommentSerializer
    permission_classes = (IsCommentAuthorOrReadonly,)

    def get_queryset(self):
        qs = self.queryset

        post_id = self.request.GET.get("post_id", None)
        username = self.request.GET.get("author", None)

        if post_id:
            qs = qs.filter(post__pk=post_id)
        if username:
            qs = qs.filter(user__username=username)
        return qs

    def perform_create(self, serializer):
        return serializer.save(user=self.request.user)

class PostViewset(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = (IsPostAuthorOrReadonly,)

    def get_queryset(self):
        qs = Post.objects.with_feed_fields()

        author = self.request.GET.get("author", None)
        liked_by = self.request.GET.get("liked_by", None)

        if author:
            qs = qs.filter(author__username=author)
        if liked_by:
            qs = qs.filter(likes__user__username=liked_by)
        return qs

    @action(methods=["POST"], detail=True, permission_classes=[permissions.IsAuthenticated])
    def like(self, request, *args, **kwargs):
        post = self.get_object()

        deleted, _ = Like.objects.filter(user=self.request.user, post=post).delete()
        if deleted:
            return Response(data={"detail": "You have unliked this post", "like": None}, status=202)
        try:
            like = Like.objects.create(post=post, user=self.request.user)
        except IntegrityError:
            like = Like.objects.get(post=post, user=self.request.user)
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
