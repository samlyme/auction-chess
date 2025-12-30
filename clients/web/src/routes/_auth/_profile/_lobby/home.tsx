import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_profile/_lobby/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/_profile/_lobby/home"!</div>
}
