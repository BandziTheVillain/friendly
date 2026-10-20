from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.test import APITestCase

from friend_requests.models import FriendRequest, FRStatus
from . import services
from .models import Friendship
from .services import Conflict, Relationship

User = get_user_model()


def make_user(username):
    return User.objects.create_user(username=username, password="pw", first_name=username.title())


class FriendServiceTests(TestCase):
    def setUp(self):
        self.alice = make_user("alice")
        self.bob = make_user("bob")
        self.carol = make_user("carol")

    def befriend(self, a, b):
        req = services.send_request(a, b)
        services.accept_request(req.pk, b)

    def test_send_and_accept_creates_symmetric_friendship(self):
        req = services.send_request(self.alice, self.bob)
        self.assertEqual(req.status, FRStatus.PENDING)

        services.accept_request(req.pk, self.bob)

        self.assertTrue(services.are_friends(self.alice, self.bob))
        self.assertTrue(services.are_friends(self.bob, self.alice))
        self.assertEqual(Friendship.objects.count(), 2)
        req.refresh_from_db()
        self.assertEqual(req.status, FRStatus.ACCEPTED)

    def test_cannot_request_self(self):
        with self.assertRaises(ValidationError):
            services.send_request(self.alice, self.alice)

    def test_duplicate_request_conflicts(self):
        services.send_request(self.alice, self.bob)
        with self.assertRaises(Conflict):
            services.send_request(self.alice, self.bob)

    def test_request_to_existing_friend_conflicts(self):
        self.befriend(self.alice, self.bob)
        with self.assertRaises(Conflict):
            services.send_request(self.bob, self.alice)

    def test_crossed_requests_auto_accept(self):
        services.send_request(self.alice, self.bob)
        req = services.send_request(self.bob, self.alice)

        self.assertEqual(req.status, FRStatus.ACCEPTED)
        self.assertTrue(services.are_friends(self.alice, self.bob))
        self.assertFalse(FriendRequest.objects.filter(status=FRStatus.PENDING).exists())

    def test_only_recipient_can_accept_or_decline(self):
        req = services.send_request(self.alice, self.bob)
        for action in (services.accept_request, services.decline_request):
            for user in (self.alice, self.carol):
                with self.assertRaises(PermissionDenied):
                    action(req.pk, user)
        self.assertFalse(services.are_friends(self.alice, self.bob))

    def test_cannot_accept_declined_request(self):
        req = services.send_request(self.alice, self.bob)
        services.decline_request(req.pk, self.bob)
        with self.assertRaises(Conflict):
            services.accept_request(req.pk, self.bob)

    def test_can_rerequest_after_decline(self):
        req = services.send_request(self.alice, self.bob)
        services.decline_request(req.pk, self.bob)

        again = services.send_request(self.alice, self.bob)
        self.assertEqual(again.status, FRStatus.PENDING)

    def test_only_sender_can_cancel(self):
        req = services.send_request(self.alice, self.bob)
        with self.assertRaises(PermissionDenied):
            services.cancel_request(req.pk, self.bob)
        services.cancel_request(req.pk, self.alice)
        self.assertFalse(FriendRequest.objects.exists())

    def test_unfriend_removes_both_rows_and_allows_rerequest(self):
        self.befriend(self.alice, self.bob)
        services.unfriend(self.bob, self.alice)

        self.assertFalse(Friendship.objects.exists())
        services.send_request(self.alice, self.bob)

    def test_unfriend_non_friend_is_not_found(self):
        with self.assertRaises(NotFound):
            services.unfriend(self.alice, self.bob)

    def test_suggested_excludes_self_friends_and_pending_both_ways(self):
        dave = make_user("dave")
        erin = make_user("erin")
        self.befriend(self.alice, self.bob)
        services.send_request(self.alice, self.carol)
        services.send_request(dave, self.alice)

        self.assertEqual(list(services.suggested_friends(self.alice)), [erin])

    def test_relationship(self):
        dave = make_user("dave")
        self.befriend(self.alice, self.bob)
        services.send_request(self.alice, self.carol)
        services.send_request(dave, self.alice)

        index = services.RelationshipIndex(self.alice)
        self.assertEqual(index.of(self.alice), Relationship.SELF)
        self.assertEqual(index.of(self.bob), Relationship.FRIENDS)
        self.assertEqual(index.of(self.carol), Relationship.REQUEST_SENT)
        self.assertEqual(index.of(dave), Relationship.REQUEST_RECEIVED)
        self.assertEqual(services.relationship(self.bob, self.carol), Relationship.NONE)

    def test_profile_friends_count(self):
        self.befriend(self.alice, self.bob)
        self.befriend(self.alice, self.carol)
        self.assertEqual(self.alice.profile.friends_count, 2)
        self.assertEqual(self.bob.profile.friends_count, 1)


class FriendAPITests(APITestCase):
    def setUp(self):
        self.alice = make_user("alice")
        self.bob = make_user("bob")
        self.carol = make_user("carol")

    def test_full_request_flow(self):
        self.client.force_authenticate(self.alice)
        res = self.client.post("/api/friend-requests/", {"recipient": "bob"}, format="json")
        self.assertEqual(res.status_code, 201)
        request_id = res.data["id"]

        res = self.client.post(f"/api/friend-requests/{request_id}/accept/")
        self.assertEqual(res.status_code, 403)

        self.client.force_authenticate(self.bob)
        res = self.client.get("/api/friend-requests/?box=incoming")
        self.assertEqual([r["id"] for r in res.data["results"]], [request_id])

        res = self.client.post(f"/api/friend-requests/{request_id}/accept/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["status"], FRStatus.ACCEPTED)

        res = self.client.get("/api/users/alice/friends/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["results"][0]["username"], "bob")
        self.assertEqual(res.data["results"][0]["friends_count"], 1)
        self.assertEqual(res.data["results"][0]["relationship"], Relationship.SELF)

        res = self.client.get("/api/users/alice/relationship/")
        self.assertEqual(res.data, {"relationship": Relationship.FRIENDS})

        res = self.client.delete(f"/api/friends/{self.alice.pk}/")
        self.assertEqual(res.status_code, 204)
        self.assertFalse(services.are_friends(self.alice, self.bob))

    def test_send_errors(self):
        self.client.force_authenticate(self.alice)
        self.assertEqual(self.client.post("/api/friend-requests/", {}, format="json").status_code, 400)
        self.assertEqual(self.client.post("/api/friend-requests/", {"recipient": "nobody"}, format="json").status_code, 404)
        self.assertEqual(self.client.post("/api/friend-requests/", {"recipient": "alice"}, format="json").status_code, 400)
        self.client.post("/api/friend-requests/", {"recipient": "bob"}, format="json")
        self.assertEqual(self.client.post("/api/friend-requests/", {"recipient": "bob"}, format="json").status_code, 409)

    def test_cancel_and_outgoing_box(self):
        self.client.force_authenticate(self.alice)
        request_id = self.client.post("/api/friend-requests/", {"recipient": "bob"}, format="json").data["id"]
        self.assertEqual(self.client.get("/api/friend-requests/?box=outgoing").data["count"], 1)

        self.client.force_authenticate(self.carol)
        self.assertEqual(self.client.delete(f"/api/friend-requests/{request_id}/").status_code, 403)

        self.client.force_authenticate(self.alice)
        self.assertEqual(self.client.delete(f"/api/friend-requests/{request_id}/").status_code, 204)
        self.assertEqual(self.client.get("/api/friend-requests/?box=outgoing").data["count"], 0)

    def test_suggested_includes_relationship(self):
        self.client.force_authenticate(self.alice)
        res = self.client.get("/api/friends/suggested/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual({u["username"] for u in res.data["results"]}, {"bob", "carol"})
        self.assertTrue(all(u["relationship"] == Relationship.NONE for u in res.data["results"]))

    def test_profile_by_username_includes_relationship(self):
        req = services.send_request(self.alice, self.bob)

        self.client.force_authenticate(self.bob)
        res = self.client.get("/api/profiles/alice/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["username"], "alice")
        self.assertEqual(res.data["relationship"], Relationship.REQUEST_RECEIVED)
        self.assertEqual(res.data["friend_request_id"], req.pk)
        self.assertEqual(res.data["friends_count"], 0)

        services.accept_request(req.pk, self.bob)
        res = self.client.get("/api/profiles/alice/")
        self.assertEqual(res.data["relationship"], Relationship.FRIENDS)
        self.assertIsNone(res.data["friend_request_id"])
        self.assertEqual(res.data["friends_count"], 1)

        self.assertEqual(self.client.get("/api/profiles/bob/").data["relationship"], Relationship.SELF)
        self.assertEqual(self.client.get("/api/profiles/nobody/").status_code, 404)

    def test_anonymous_cannot_mutate(self):
        self.assertIn(self.client.post("/api/friend-requests/", {"recipient": "bob"}).status_code, (401, 403))
        self.assertIn(self.client.delete(f"/api/friends/{self.bob.pk}/").status_code, (401, 403))
        self.assertIn(self.client.get("/api/friends/suggested/").status_code, (401, 403))
