import { useEffect, useRef, useState } from 'react'
import { Layout } from '@/components/Layout'
import { SuggestedUserCard } from '@/components/UserCard'
import useDebounce from '@/hooks/useDebounced'
import { api } from '@/lib/api'
import { createFileRoute } from '@tanstack/react-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Compass, LoaderCircle, Search, SearchX } from 'lucide-react'

export const Route = createFileRoute('/_protected/discover')({
  component: Page,
  // ?q= keeps the search across refreshes and lets the sidebar search box link here
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" && search.q ? { q: search.q } : {},
})

function Page() {
  const { q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [text, setText] = useState(q);
  const query = useDebounce(text.trim(), 300);

  // a new search from the sidebar while already on this page
  useEffect(() => {
    if (q !== text.trim()) setText(q);
  }, [q]);

  useEffect(() => {
    if (query !== q) navigate({ search: query ? { q: query } : {}, replace: true });
  }, [query]);

  return (
    <Layout>
      <div className="mx-auto max-w-2xl py-6">
        <div className="page-header mb-4 rounded-2xl border border-line">
          <h1 className="text-2xl font-extrabold">Discover</h1>
          <p className="text-sm text-white/45">See who else is hanging out here</p>
        </div>

        <label className="flex items-center gap-3 rounded-full border border-line bg-surface-2 px-5 py-3.5 transition focus-within:border-white/30">
          <Search className="h-5 w-5 shrink-0 text-white/40" />
          <input
            type="search"
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search for users…"
            className="w-full bg-transparent text-[15px] text-white placeholder:text-white/35 focus:outline-none"
          />
        </label>

        <div className="mt-6">
          {query ? (
            <Results query={query} />
          ) : (
            <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
              <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet/15">
                <Compass className="h-6 w-6 text-violet" />
              </span>
              <p className="font-bold">Go on, have a look around</p>
              <p className="max-w-sm text-sm text-white/45">Search by name or username to find someone.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

function Results({ query }: { query: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } = useInfiniteQuery({
    queryKey: ["user-search", query],
    queryFn: async ({ pageParam }): Promise<APIResponse<User>> => {
      const res = await api.get("/users/search/", { params: { q: query, page: pageParam } });
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
      <div className="flex h-40 items-center justify-center text-white/50">
        <LoaderCircle size={28} className="animate-spin" />
      </div>
    );
  }

  const users = data?.pages.flatMap((page) => page.results) ?? [];

  if (isError || users.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
        <SearchX className="h-8 w-8 text-white/40" />
        <p className="font-bold">{isError ? "Search didn't work" : "No one found"}</p>
        <p className="max-w-sm break-words text-sm text-white/45">
          {isError ? "Give it another go in a moment." : <>Nobody matches “{query}”. Try a different name or username.</>}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="card divide-y divide-line p-2">
        {users.map((user) => <SuggestedUserCard key={user.id} user={user} />)}
      </div>
      <div ref={loadMoreRef}>
        {isFetchingNextPage && (
          <div className="flex justify-center py-4 text-white/50">
            <LoaderCircle className="animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
