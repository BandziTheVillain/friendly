from django.db import migrations


def copy_friend_lists(apps, schema_editor):
    """Turn every Friend.friends link into a pair of Friendship rows."""
    Friend = apps.get_model("friends", "Friend")
    Friendship = apps.get_model("friends", "Friendship")

    pairs = set()
    for friend_list in Friend.objects.prefetch_related("friends"):
        for other in friend_list.friends.all():
            if other.pk == friend_list.user_id:
                continue
            pairs.add((friend_list.user_id, other.pk))
            pairs.add((other.pk, friend_list.user_id))

    Friendship.objects.bulk_create(
        [Friendship(user_id=u, friend_id=f) for u, f in pairs],
        ignore_conflicts=True,
    )


class Migration(migrations.Migration):

    dependencies = [
        ('friends', '0003_friendship'),
    ]

    operations = [
        migrations.RunPython(copy_friend_lists, migrations.RunPython.noop),
    ]
