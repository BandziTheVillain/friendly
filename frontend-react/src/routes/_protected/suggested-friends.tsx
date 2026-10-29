import { createFileRoute, redirect } from '@tanstack/react-router'

// the suggestions page lives under /connect now; keep the old URL working
export const Route = createFileRoute('/_protected/suggested-friends')({
  beforeLoad: () => {
    throw redirect({ to: "/connect/suggested-friends" })
  },
})
