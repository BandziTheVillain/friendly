import { useAuthStore } from '@/store/auth';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ location }) => {
    const { user, isSignedIn } = useAuthStore.getState();
    if (!user || !isSignedIn && location.pathname !== "/auth/sign-in") {
        throw redirect({
            to: "/auth/sign-in",
        })
    }
  },
  head: () => seo({ noindex: true }),
  component: () => <Outlet />,
})


