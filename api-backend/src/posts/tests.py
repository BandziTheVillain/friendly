from django.contrib.auth import get_user_model
from django.db import connection
from django.test.utils import CaptureQueriesContext
from rest_framework.test import APITestCase

from friends import services
from .models import Comment, Like, Post

User = get_user_model()


def make_user(username):
    return User.objects.create_user(username=username, password="pw")


class PostPermissionTests(APITestCase):
    def setUp(self):
        self.alice = make_user("alice")
        self.bob = make_user("bob")
        self.post = Post.objects.create(text="hi", author=self.alice)

    def test_anyone_can_read_a_single_post(self):
        self.assertEqual(self.client.get(f"/api/posts/{self.post.pk}/").status_code, 200)
        self.client.force_authenticate(self.bob)
        res = self.client.get(f"/api/posts/{self.post.pk}/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["like_count"], 0)

    def test_only_author_can_edit_or_delete(self):
        self.client.force_authenticate(self.bob)
        self.assertEqual(self.client.patch(f"/api/posts/{self.post.pk}/", {"text": "x"}, format="json").status_code, 403)
        self.assertEqual(self.client.delete(f"/api/posts/{self.post.pk}/").status_code, 403)

        self.client.force_authenticate(self.alice)
        self.assertEqual(self.client.patch(f"/api/posts/{self.post.pk}/", {"text": "edited"}, format="json").status_code, 200)

    def test_anyone_logged_in_can_like_and_unlike(self):
        self.client.force_authenticate(self.bob)
        self.assertEqual(self.client.post(f"/api/posts/{self.post.pk}/like/").status_code, 201)
        self.assertTrue(Like.objects.filter(post=self.post, user=self.bob).exists())
        self.assertEqual(self.client.post(f"/api/posts/{self.post.pk}/like/").status_code, 202)
        self.assertFalse(Like.objects.exists())

    def test_anonymous_cannot_like(self):
        self.assertIn(self.client.post(f"/api/posts/{self.post.pk}/like/").status_code, (401, 403))

    def test_editing_keeps_date_created(self):
        created = self.post.date_created
        self.post.text = "edited"
        self.post.save()
        self.post.refresh_from_db()
        self.assertEqual(self.post.date_created, created)


class CommentPermissionTests(APITestCase):
    def setUp(self):
        self.alice = make_user("alice")
        self.bob = make_user("bob")
        post = Post.objects.create(text="hi", author=self.alice)
        self.comment = Comment.objects.create(text="mine", post=post, user=self.alice)

    def test_only_author_can_edit_or_delete(self):
        self.client.force_authenticate(self.bob)
        self.assertEqual(self.client.patch(f"/api/comments/{self.comment.pk}/", {"text": "x"}, format="json").status_code, 403)
        self.assertEqual(self.client.delete(f"/api/comments/{self.comment.pk}/").status_code, 403)
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.text, "mine")

        self.client.force_authenticate(self.alice)
        self.assertEqual(self.client.delete(f"/api/comments/{self.comment.pk}/").status_code, 204)

    def test_filter_by_author(self):
        res = self.client.get("/api/comments/?author=alice")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(self.client.get("/api/comments/?author=bob").data["count"], 0)


class TimelineTests(APITestCase):
    def setUp(self):
        self.alice = make_user("alice")
        self.bob = make_user("bob")
        self.carol = make_user("carol")
        services.accept_request(services.send_request(self.alice, self.bob).pk, self.bob)
        Post.objects.create(text="alice", author=self.alice)
        Post.objects.create(text="bob", author=self.bob)
        Post.objects.create(text="carol", author=self.carol)

    def test_requires_login(self):
        self.assertIn(self.client.get("/api/timeline").status_code, (401, 403))

    def test_shows_own_and_friends_posts_only(self):
        self.client.force_authenticate(self.alice)
        # ?user= is ignored: you only ever get your own feed
        res = self.client.get("/api/timeline?user=carol")
        self.assertEqual({p["text"] for p in res.data["results"]}, {"alice", "bob"})

    def test_counts_and_query_count(self):
        post = Post.objects.get(text="bob")
        Like.objects.create(post=post, user=self.alice)
        Like.objects.create(post=post, user=self.bob)
        Comment.objects.create(post=post, user=self.alice, text="c")
        for i in range(20):
            Post.objects.create(text=str(i), author=self.bob)

        self.client.force_authenticate(self.alice)
        with CaptureQueriesContext(connection) as queries:
            res = self.client.get("/api/timeline", {"page_size": 30})
        bob_post = next(p for p in res.data["results"] if p["text"] == "bob")
        self.assertEqual((bob_post["like_count"], bob_post["comment_count"]), (2, 1))
        # auth + friends subquery + count + page; must not grow with the number of posts
        self.assertLess(len(queries), 8)
