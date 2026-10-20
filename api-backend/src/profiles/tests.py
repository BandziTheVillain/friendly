from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class ProfileUpdateTests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user(username="alice", password="pw")
        self.bob = User.objects.create_user(username="bob", password="pw")

    def url(self, user):
        return f"/api/profiles/user/{user.pk}"

    def test_get_profile(self):
        res = self.client.get(self.url(self.alice))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["username"], "alice")

    def test_unknown_profile_is_404(self):
        self.assertEqual(self.client.get("/api/profiles/user/00000000-0000-0000-0000-000000000000").status_code, 404)

    def test_cannot_edit_someone_elses_profile(self):
        self.client.force_authenticate(self.bob)
        res = self.client.patch(self.url(self.alice), {"bio": "hacked"}, format="json")
        self.assertEqual(res.status_code, 403)
        self.alice.profile.refresh_from_db()
        self.assertIsNone(self.alice.profile.bio)

    def test_anonymous_cannot_edit(self):
        self.assertIn(self.client.patch(self.url(self.alice), {"bio": "x"}, format="json").status_code, (401, 403))

    def test_edit_own_profile_including_name(self):
        self.client.force_authenticate(self.alice)
        res = self.client.patch(self.url(self.alice), {"bio": "hello", "first_name": "Alice"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.alice.refresh_from_db()
        self.assertEqual((self.alice.profile.bio, self.alice.first_name), ("hello", "Alice"))

    def test_owner_username_and_user_are_read_only(self):
        self.client.force_authenticate(self.alice)
        self.client.patch(self.url(self.alice), {"user": str(self.bob.pk), "username": "evil"}, format="json")
        self.alice.refresh_from_db()
        self.assertEqual(self.alice.username, "alice")
        self.assertEqual(self.alice.profile.user_id, self.alice.pk)
