import Connect from '@/components/Connect'
import { SuggestedUserCard } from '@/components/UserCard';
import { api } from '@/lib/api';
import { createFileRoute } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react';

const getSuggestedFriends = async () : Promise<APIResponse<User>> => {
  const res = await api.get("/friends/suggested/");
  return res.data;
};

export const Route = createFileRoute('/_protected/connect/suggested-friends')({
  component: Page,
  loader: async () => {
    return await getSuggestedFriends();
  },
  pendingComponent: () => (
    <Connect>
      <div className='flex h-60 w-full items-center justify-center text-white/50'>
        <LoaderCircle size={32} className='animate-spin' />
      </div>
    </Connect>
  ),
})

function Page() {
  const data = Route.useLoaderData();
  const users = data?.results ?? [];

  return (
    <Connect>
      {users.length === 0 ? (
        <p className="card px-6 py-12 text-center text-sm text-white/50">No one new right now — check back soon!</p>
      ) : (
        <div className="card divide-y divide-line p-2">
          {users.map((user) => <SuggestedUserCard key={user.id} user={user} />)}
        </div>
      )}
    </Connect>
  )
}
