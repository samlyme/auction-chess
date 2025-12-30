import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";

export interface RouterContext {
  auth: {
    session: Session | null;
    loading: boolean;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
}
