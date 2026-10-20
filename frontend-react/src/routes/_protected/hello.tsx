import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/hello')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/hello"!</div>
}
