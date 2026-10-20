from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class TokenRefreshFlowTests(APITestCase):
    """The frontend's 401 -> POST /api/auth/token/refresh/ -> retry flow (lib/api.ts)."""

    def setUp(self):
        User.objects.create_user(username="alice", email="alice@example.com", password="a-long-pw-123")
        res = self.client.post("/api/auth/login/", {"username": "alice", "password": "a-long-pw-123"}, format="json")
        self.assertEqual(res.status_code, 200, res.data)
        self.access_cookie = settings.AUTH_KIT.get("AUTH_JWT_COOKIE_NAME", "auth-jwt")
        self.assertIn(self.access_cookie, self.client.cookies)

    def test_expired_access_gets_401_and_refresh_restores_it(self):
        self.assertEqual(self.client.get("/api/friend-requests/").status_code, 200)

        # simulate the 15 minute access token expiring: the browser drops the cookie
        del self.client.cookies[self.access_cookie]
        # must be 401 (not 403): that's the only status the frontend interceptor refreshes on
        self.assertEqual(self.client.get("/api/friend-requests/").status_code, 401)

        res = self.client.post("/api/auth/token/refresh/", format="json")
        self.assertEqual(res.status_code, 200, res.data)
        self.assertIn(self.access_cookie, res.cookies)

        self.assertEqual(self.client.get("/api/friend-requests/").status_code, 200)
