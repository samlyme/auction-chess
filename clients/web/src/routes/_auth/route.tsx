import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { DesiredRouteSearchParam } from '../-types';

export const Route = createFileRoute('/_auth')({
  validateSearch: DesiredRouteSearchParam,
  beforeLoad: ({context, search}) => {
    if (!context.auth.session) {
      throw redirect({ to: "/auth", search });
    }
    return { auth: { session: context.auth.session } }
  },
  component: () => <Outlet/>,
})
