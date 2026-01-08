import LobbySearch from '@/components/lobby/Search'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_profile/_lobby/home')({
  beforeLoad: ({ context: {lobby} }) => {
    if (lobby) throw redirect({ to: "/lobby", search: { code: lobby.code }})
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <LobbySearch setLobby={() => {}}/>
}
