import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { Session } from '@supabase/supabase-js';
import type { QueryClient } from '@tanstack/react-query';

export interface RouterContext {
  auth: {
    session: Session | null;
    loading: boolean;
  };
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}
