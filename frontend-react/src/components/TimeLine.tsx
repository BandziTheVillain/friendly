import { type JSX, useEffect, useRef } from "react";
import PostMedia from "./Post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LoaderCircle, Sparkles, TriangleAlert } from "lucide-react";


export default function Timeline({ user } : { user: User }): JSX.Element {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    error 
  } = useInfiniteQuery({
    queryKey: [
      "user-timeline",
      user.id,
    ],
    queryFn: async ({ pageParam }) : Promise<APIResponse<Post>> => {
      // the backend always returns the signed-in user's feed
      const res = await api.get("/timeline", {
        params: {
          page: pageParam,
        }
      });
      return res.data;
    },
    initialPageParam: "1",
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.next) {
        return undefined;
      }

      return (allPages.length + 1).toString()
    }
  });

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      const firstEntry = entries[0];

      if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }, {
      threshold: 0.1
    })

    observer.observe(element);

    return () => {
      observer.disconnect()
    }

  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card animate-pulse p-4">
            <div className="flex gap-3">
              <div className="h-11 w-11 rounded-full bg-white/8" />
              <div className="flex-1 space-y-2.5 pt-1">
                <div className="h-3 w-1/3 rounded-full bg-white/8" />
                <div className="h-3 w-5/6 rounded-full bg-white/6" />
                <div className="h-3 w-2/3 rounded-full bg-white/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
        <TriangleAlert className="h-8 w-8 text-flame" />
        <p className="font-bold">Oops, something broke</p>
        <p className="text-sm text-white/45">We couldn't load your feed. Give it a refresh?</p>
      </div>
    )
  }

  const posts = data?.pages.flatMap((page) => page.results) || []

  if (posts.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
        <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-flame/10">
          <Sparkles className="h-6 w-6 text-flame" />
        </span>
        <p className="font-bold">Pretty quiet in here…</p>
        <p className="text-sm text-white/45">Post something or add a few friends to get things going.</p>
      </div>
    )
  };

  return (
    <main>
      {/* Feed */}
      <div>
        {posts.map((post) => (
          <PostMedia key={post.id} post={post} />
        ))}
      </div>
 
      <div ref={loadMoreRef}>
        {isFetchingNextPage && (
          <div className="flex justify-center py-6 text-white/50">
            <LoaderCircle className="animate-spin" />
          </div>
        )}

        {!hasNextPage && (
          <p className="py-8 text-center text-sm font-semibold text-white/40">
            That's everything for now
          </p>
        )}
      </div>

    </main>
  );
}