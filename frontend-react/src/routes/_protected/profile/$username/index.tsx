import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Grid3x3,
  Heart,
  Link2,
  LogOut,
  Pencil,
  Settings,
  MoreHorizontal,
  LoaderCircle,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import PostMedia from "@/components/Post";
import { EditProfileDialog } from "@/components/EditProfileDialog";

import { createFileRoute, Link } from '@tanstack/react-router';
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { signOut } from "@/lib/auth";
import {
  FRIENDS_QUERY_KEY,
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  errorMessage,
  sendFriendRequest,
  unfriend,
} from "@/lib/friends";

import { displayName, getUserProfile, profileKey } from "@/lib/profiles";

export const Route = createFileRoute('/_protected/profile/$username/')({
  component: Page,
})

/* ---------- Data ---------- */

const TABS = [
  { id: "posts", label: "Posts", icon: Grid3x3 },
  { id: "liked", label: "Liked", icon: Heart },
] as const;

type Tab = (typeof TABS)[number]["id"];

/* ---------- Component ---------- */

function Page() {
  const { username } = Route.useParams();
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);

  const { data: profile, isPending, isError } = useQuery({
    queryKey: profileKey(username),
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

  const name = displayName(profile);
  const isSelf = profile.relationship === "self";
  const joined = format(new Date(profile.date_joined.replace(" ", "T")), "MMMM yyyy");

  return (
    <Layout>
      <div className="mx-auto max-w-3xl py-6">
        {/* Cover */}
        <div
          style={profile.cover_img ? { backgroundImage: `url('${profile.cover_img}')` } : undefined}
          className="relative h-48 w-full rounded-3xl border border-line bg-surface-2 bg-cover bg-center sm:h-56"
        >
          <OptionsMenu profile={profile} onEdit={() => setEditing(true)} />
        </div>

        {/* Header */}
        <div className="px-6">
          <div className="-mt-12 flex items-end justify-between sm:-mt-14">
            <span className="relative rounded-full">
              <img
                src={profile.avatar}
                alt={name}
                className="h-24 w-24 rounded-full border-4 border-ink object-cover sm:h-28 sm:w-28"
              />
            </span>

            <div className="flex gap-2 pb-1">
              {isSelf ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:bg-white/6"
                  aria-label="Edit profile"
                  title="Edit profile"
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
              <p className="mt-3 max-w-xl whitespace-pre-wrap text-[15px] leading-snug text-white/80">{profile.bio}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/50">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {joined}
              </span>
            </div>

            <div className="mt-4 flex gap-3">
              <Link
                to="/profile/$username/friends"
                params={{ username: profile.username }}
                className="rounded-xl border border-line bg-surface px-4 py-2 text-left transition-colors hover:bg-white/6"
              >
                <span className="block text-lg font-extrabold leading-tight text-white">{profile.friends_count}</span>
                <span className="text-xs text-white/50">Friends</span>
              </Link>
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

        <div className="mt-6">
          <ProfilePosts username={profile.username} tab={tab} isSelf={isSelf} />
        </div>
      </div>

      {editing && <EditProfileDialog profile={profile} onClose={() => setEditing(false)} />}
    </Layout>
  );
}

/* ---------- Posts ---------- */

function ProfilePosts({ username, tab, isSelf }: { username: string; tab: Tab; isSelf: boolean }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } = useInfiniteQuery({
    // under "user-timeline" so composing and liking (which invalidate it) refresh these lists too
    queryKey: ["user-timeline", "profile", username, tab],
    queryFn: async ({ pageParam }): Promise<APIResponse<Post>> => {
      const res = await api.get("/posts/", {
        params: { page: pageParam, [tab === "posts" ? "author" : "liked_by"]: username },
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
  });

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { threshold: 0.1 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isPending) {
    return (
      <div className="flex justify-center py-14 text-white/50">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.results) ?? [];

  if (isError || posts.length === 0) {
    const empty = tab === "posts"
      ? (isSelf ? "Your posts will show up here." : "No posts yet.")
      : (isSelf ? "Posts you like will show up here." : "No liked posts yet.");
    return (
      <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
        <p className="font-semibold">{isError ? "Couldn't load posts" : "Nothing here yet"}</p>
        <p className="text-sm text-white/45">{isError ? "Give it a refresh?" : empty}</p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostMedia key={post.id} post={post} />
      ))}
      <div ref={loadMoreRef}>
        {isFetchingNextPage && (
          <div className="flex justify-center py-6 text-white/50">
            <LoaderCircle className="animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Options menu ---------- */

function OptionsMenu({ profile, onEdit }: { profile: Profile; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copyLink = async () => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.username}`);
      toast.success("Profile link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const item = "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/85 transition-colors hover:bg-white/6";

  return (
    <div ref={ref} className="absolute right-4 top-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur transition-colors hover:bg-black/45"
        aria-label="More options"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="card absolute right-0 z-20 mt-2 w-48 overflow-hidden py-1 shadow-xl">
          <button type="button" className={item} onClick={copyLink}>
            <Link2 className="h-4 w-4" />
            Copy profile link
          </button>
          {profile.relationship === "self" && (
            <>
              <button type="button" className={item} onClick={() => { setOpen(false); onEdit(); }}>
                <Pencil className="h-4 w-4" />
                Edit profile
              </button>
              {/* the sidebar's logout is hidden on phones */}
              <button type="button" className={`${item} text-flame!`} onClick={signOut}>
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </div>
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
