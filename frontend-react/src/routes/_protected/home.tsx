import { Compose } from '@/components/Compose';
import { Layout } from '@/components/Layout';
import { Suggested } from '@/components/Suggested';
import Timeline from '@/components/TimeLine';
import { useAuthStore } from '@/store/auth';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/home')({ component: Home })

function Home() {
  const { user } = useAuthStore.getState();

  return (
    <Layout>
      <div className="flex w-full gap-8 py-6">
        <main className="min-w-0 max-w-2xl flex-1">
          <div className="page-header mb-4 rounded-2xl border border-line">
            <h1 className="text-2xl font-extrabold">Hey {user?.first_name || user?.username}</h1>
            <p className="text-sm text-white/50">Here's what your friends have been up to</p>
          </div>
          <Compose />
          <Timeline user={user!} />
        </main>
        <div className="hidden w-80 shrink-0 xl:block">
          <div className="sticky top-6">
            <Suggested />
          </div>
        </div>
      </div>
    </Layout>
  )
}
