import { useState } from "react";
import {
  Calendar,
  Grid3x3,
  Heart,
  Bookmark,
  Settings,
  MoreHorizontal,
  LoaderCircle,
} from "lucide-react";
import { Layout } from "@/components/Layout";

import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import {
  FRIENDS_QUERY_KEY,
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  errorMessage,
  sendFriendRequest,
  unfriend,
} from "@/lib/friends";

const getUserProfile = async (username: string) : Promise<Profile> => {
  const res = await api.get(`/profiles/${username}/`);
  return res.data;
}

export const Route = createFileRoute('/_protected/profile/$username')({
  component: Page,
})

/* ---------- Data ---------- */

const TABS = [
  { id: "posts", label: "Posts", icon: Grid3x3 },
  { id: "liked", label: "Liked", icon: Heart },
  { id: "saved", label: "Saved", icon: Bookmark },
] as const;

/* ---------- Component ---------- */

function Page() {
  const { username } = Route.useParams();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("posts");

  // keyed under FRIENDS_QUERY_KEY so friend actions anywhere refresh the button and count
  const { data: profile, isPending, isError } = useQuery({
    queryKey: [FRIENDS_QUERY_KEY, "profile", username],
    queryFn: () => getUserProfile(username),
  });

  if (isPending || isError) {
    return (
      <Layout>
        <div className="mx-auto flex h-80 max-w-3xl items-center justify-center py-6 text-white/50">
          {isPending ? <LoaderCircle size={32} className="animate-spin" /> : <p className="text-sm">Couldn't find that profile.</p>}
        </div>
      </Layout>
    );
  }

  const name = `${profile.first_name} ${profile.last_name}`.trim() || profile.username;
  // the API sends "YYYY-MM-DD HH:MM:SS+00:00"; the "T" makes it parse everywhere
  const joined = format(new Date(profile.date_joined.replace(" ", "T")), "MMMM yyyy");

  return (
    <Layout>
      <div className="mx-auto max-w-3xl py-6">
      {/* Cover */}
      <div
        style={profile.cover_img ? { backgroundImage: `url('${profile.cover_img}')` } : undefined}
        className="relative h-48 w-full overflow-hidden rounded-3xl border border-line bg-surface-2 bg-cover bg-center sm:h-56"
      >
        <button
          type="button"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur transition-colors hover:bg-black/45"
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Header */}
      <div className="px-6">
        <div className="-mt-12 flex items-end justify-between sm:-mt-14">
          <span className="relative rounded-full">
            <img
              src={profile.avatar}
              alt={name}
              className="h-24 w-24 z-10 rounded-full border-4 border-ink object-cover sm:h-28 sm:w-28"
            />
          </span>

          <div className="flex gap-2 pb-1">
            {profile.relationship === "self" ? (
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:bg-white/6"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            ) : (
              <FriendButton profile={profile} name={name} />
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">{name}</h1>
          </div>
          <p className="text-sm text-white/50">@{profile.username}</p>

          {profile.bio && (
            <p className="mt-3 max-w-xl text-[15px] leading-snug text-white/80">{profile.bio}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {joined}
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            <div className="rounded-xl border border-line bg-surface px-4 py-2 text-left">
              <span className="block text-lg font-extrabold leading-tight text-white">{profile.friends_count}</span>
              <span className="text-xs text-white/50">Friends</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-line">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors sm:flex-none sm:px-8 ${
                  isActive ? "text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                {isActive && (
                  <span className="absolute inset-x-3 bottom-0 h-0.75 rounded-full bg-flame" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card mt-6 flex flex-col items-center gap-2 px-6 py-14 text-center">
        <p className="font-semibold">Nothing here yet</p>
        <p className="text-sm text-white/45">Posts will show up here.</p>
      </div>
      </div>

      {/* Grid */}
      {/* <div className="grid grid-cols-3 gap-[2px] px-[2px] pb-10 pt-[2px] sm:gap-1 sm:px-1">
        {(tab === "posts" ? POSTS : POSTS.slice().reverse()).map((post) => (
          <button
            key={post.id}
            className={`group relative aspect-[3/4] overflow-hidden bg-gradient-to-br ${post.gradient}`}
          >
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
            {post.isVideo && (
              <Play className="absolute right-2 top-2 h-4 w-4 fill-white text-white drop-shadow" />
            )}
            <span className="absolute bottom-2 left-2 text-xs font-medium text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100">
              {post.views} views
            </span>
          </button>
        ))}
      </div> */}
    </Layout>
  );
}

/* ---------- Friend button ---------- */

function FriendButton({ profile, name }: { profile: Profile; name: string }) {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const requestId = profile.friend_request_id;

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      // refetches this profile (button + count), the requests tab badge and suggestions
      await client.invalidateQueries({ queryKey: [FRIENDS_QUERY_KEY] });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const ghost = "btn-ghost px-5 py-2 text-sm disabled:opacity-50";
  const primary = "btn-primary px-5 py-2 text-sm disabled:opacity-50";

  switch (profile.relationship) {
    case "none":
      return (
        <button type="button" disabled={busy} className={primary} onClick={() => run(() => sendFriendRequest(profile.username))}>
          Befriend
        </button>
      );
    case "request_sent":
      return (
        <button
          type="button"
          disabled={busy || !requestId}
          className={ghost}
          title="Cancel friend request"
          onClick={() => requestId && run(() => cancelFriendRequest(requestId))}
        >
          Requested
        </button>
      );
    case "request_received":
      return (
        <>
          <button type="button" disabled={busy || !requestId} className={ghost} onClick={() => requestId && run(() => declineFriendRequest(requestId))}>
            Decline
          </button>
          <button type="button" disabled={busy || !requestId} className={primary} onClick={() => requestId && run(() => acceptFriendRequest(requestId))}>
            Accept
          </button>
        </>
      );
    case "friends":
      return (
        <button
          type="button"
          disabled={busy}
          className={ghost}
          title="Unfriend"
          onClick={() => window.confirm(`Unfriend ${name}?`) && run(() => unfriend(profile.user))}
        >
          Friends
        </button>
      );
    default:
      return null;
  }
}
