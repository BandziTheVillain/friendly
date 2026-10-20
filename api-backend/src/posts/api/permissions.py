from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Anyone can read; only authenticated users can create; only the owner can edit/delete.
    Subclasses set `owner_field` to the attribute holding the owning user.
    """
    owner_field = None

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(obj, f"{self.owner_field}_id") == request.user.pk


class IsPostAuthorOrReadonly(IsOwnerOrReadOnly):
    owner_field = "author"


class IsCommentAuthorOrReadonly(IsOwnerOrReadOnly):
    owner_field = "user"
