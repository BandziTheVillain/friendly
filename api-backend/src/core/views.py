from rest_framework import generics
from posts.api.serializers import PostSerializer
from posts.models import Post, User
from django.db.models import Q
from friends.services import friends_of

class UserTimelineAPIView(generics.ListAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    
    def get_queryset(self):
        username = self.request.GET.get("user")
        user = User.objects.filter(username=username).first()
        posts = Post.objects.filter(Q(author__in=friends_of(user))|Q(author=user))
        return posts