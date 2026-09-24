import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/Unauthorized')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/unauthorized"!</div>
}
