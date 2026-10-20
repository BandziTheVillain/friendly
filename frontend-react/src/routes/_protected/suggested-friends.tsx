import { Layout } from '@/components/Layout'
import { SuggestedUserCard } from '@/components/UserCard';
import { api } from '@/lib/api';
import { createFileRoute } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react';

const getSuggestedFriends = async () : Promise<APIResponse<User>> => {
  const res = await api.get("/friends/suggested/");
  return res.data;
};

const Header = () => (
    <div className="page-header mb-4 rounded-2xl border border-line">
        <h1 className="text-2xl font-extrabold">Make friends</h1>
        <p className="text-sm text-white/45">Some folks you might get along with</p>
    </div>
)

export const Route = createFileRoute('/_protected/suggested-friends')({
    component: Page,
    loader: async () => {
        return await getSuggestedFriends();
    },
    pendingComponent: () => (
        <Layout>
            <div className="mx-auto max-w-2xl py-6">
                <Header />
                <div className='flex h-60 w-full items-center justify-center text-white/50'>
                    <LoaderCircle size={32} className='animate-spin' />
                </div>
            </div>
        </Layout>
    ),
})

function Page() {
    const data = Route.useLoaderData();
    const users = data?.results ?? [];

    return (
        <Layout>
            <div className="mx-auto max-w-2xl py-6">
                <Header />
                {users.length === 0 ? (
                    <p className="card px-6 py-12 text-center text-sm text-white/50">No one new right now — check back soon!</p>
                ) : (
                    <div className="card divide-y divide-line p-2">
                        {users.map((user) => <SuggestedUserCard key={user.id} user={user} />)}
                    </div>
                )}
            </div>
        </Layout>
    )
}
