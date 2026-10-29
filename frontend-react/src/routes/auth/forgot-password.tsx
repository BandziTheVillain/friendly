import { createFileRoute } from '@tanstack/react-router'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/auth/forgot-password')({
  head: () => seo({ title: 'Reset password', noindex: true }),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/forgot-password"!</div>
}
