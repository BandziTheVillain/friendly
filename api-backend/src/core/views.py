from rest_framework import generics, permissions
from posts.api.serializers import PostSerializer
from posts.models import Post
from django.db.models import Q
from friends.services import friends_of

class UserTimelineAPIView(generics.ListAPIView):
    """The current user's feed: their own posts plus their friends' posts."""
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Post.objects.with_feed_fields().filter(Q(author__in=friends_of(user)) | Q(author=user))
