import { createFileRoute, redirect } from '@tanstack/react-router'

// the requests page lives under /connect now; keep the old URL working
export const Route = createFileRoute('/_protected/friend-requests')({
  beforeLoad: () => {
    throw redirect({ to: "/connect/friend-requests" })
  },
})
