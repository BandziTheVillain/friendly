from rest_framework import routers
from .views import PostViewset, LikeViewset, CommentViewset

router = routers.DefaultRouter()
router.register("posts", PostViewset)
router.register("likes", LikeViewset)
router.register("comments", CommentViewset)

urlpatterns = router.urls