import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/AdminPanel')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/AdminPanel"!</div>
}
