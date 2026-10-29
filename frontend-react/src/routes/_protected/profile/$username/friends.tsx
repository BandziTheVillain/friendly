import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowLeft, LoaderCircle, Users } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SuggestedUserCard } from "@/components/UserCard";
import { displayName, friendListKey, getFriendList, getUserProfile, profileKey } from "@/lib/profiles";

export const Route = createFileRoute('/_protected/profile/$username/friends')({
  component: Page,
})

function Page() {
  const { username } = Route.useParams();

  const { data: profile } = useQuery({
    queryKey: profileKey(username),
    queryFn: () => getUserProfile(username),
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } = useInfiniteQuery({
    queryKey: friendListKey(username),
    queryFn: ({ pageParam }) => getFriendList(username, pageParam),
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

  const friends = data?.pages.flatMap((page) => page.results) ?? [];
  const count = data?.pages[0].count;
  const isSelf = profile?.relationship === "self";

  let body: React.ReactNode;
  if (isPending) {
    body = (
      <div className="flex justify-center py-16 text-white/50">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  } else if (isError) {
    body = <p className="py-16 text-center text-sm text-white/50">Couldn't load friends. Give it a refresh?</p>;
  } else if (friends.length === 0) {
    body = (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-flame/10">
          <Users className="h-6 w-6 text-flame" />
        </span>
        <p className="font-semibold">No friends yet</p>
        <p className="text-sm text-white/45">
          {isSelf ? (
            <>Find some people in <Link to="/connect/suggested-friends" className="text-flame hover:underline">suggestions</Link>.</>
          ) : (
            "Their friends will show up here."
          )}
        </p>
      </div>
    );
  } else {
    body = (
      <div className="divide-y divide-line p-2">
        {friends.map((user) => <SuggestedUserCard key={user.id} user={user} />)}
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

  return (
    <Layout>
      <div className="mx-auto max-w-2xl py-6">
        <div className="page-header flex items-center gap-3 rounded-t-2xl border border-line">
          <Link
            to="/profile/$username"
            params={{ username }}
            className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/8 hover:text-white"
            aria-label="Back to profile"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold">Friends</h1>
            <p className="truncate text-xs text-white/45">
              {profile ? displayName(profile) : `@${username}`}
              {count !== undefined && ` · ${count} ${count === 1 ? "friend" : "friends"}`}
            </p>
          </div>
        </div>
        <div className="rounded-b-2xl border-x border-b border-line bg-surface/60">
          {body}
        </div>
      </div>
    </Layout>
  );
}
