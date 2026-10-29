import { SuggestedUserCard } from "./UserCard"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { FRIENDS_QUERY_KEY } from "@/lib/friends"
import { ArrowRight } from "lucide-react"

const getSuggestedFriends = async () : Promise<APIResponse<User>> => {
  const res = await api.get("/friends/suggested/", {
	params: {
		page_size: 3
	}
  });
  return res.data;
};

const Shell = ({ children }: { children: React.ReactNode }) => (
	<aside className="card p-4">
		<h2 className="mb-1 text-lg font-extrabold">People you might know</h2>
		<p className="mb-3 text-xs text-white/40">Say hi — they don't bite</p>
		{children}
	</aside>
)

export const Suggested = () => {
	const { data, isLoading, error } = useQuery({
		queryKey: [FRIENDS_QUERY_KEY, "suggested-sidebar"],
		queryFn: getSuggestedFriends
	});

	if (isLoading) {
		return (
			<Shell>
				<div className="space-y-3">
					{[0, 1, 2].map((i) => (
						<div key={i} className="flex animate-pulse items-center gap-3 p-1">
							<div className="h-11 w-11 rounded-full bg-white/8" />
							<div className="flex-1 space-y-2">
								<div className="h-3 w-2/3 rounded-full bg-white/8" />
								<div className="h-2.5 w-1/3 rounded-full bg-white/6" />
							</div>
						</div>
					))}
				</div>
			</Shell>
		)
	}

	if (error) {
		return (
			<Shell>
				<p className="py-4 text-sm text-white/50">Something went wrong</p>
			</Shell>
		)
	};

  if (data?.results.length == 0) {
    return (
      <Shell>
        <p className="py-4 text-sm text-white/50">You have no suggestions for now</p>
      </Shell>
    )
  }

  const users = data!.results;

  return (
    <Shell>
      <section className="-mx-1 space-y-1">
        {users.map((user) => <SuggestedUserCard key={user.id} user={user} compact />)}
      </section>
      <Link
        to="/connect/suggested-friends"
        className="group mt-3 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-flame transition-colors hover:bg-flame/10"
      >
        See more
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Shell>
  )
}
