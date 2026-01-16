import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import AuthContextProvider from "@/components/providers/AuthContextProvider";
import { useContext, type ReactElement } from "react";
import { AuthContext } from "@/contexts/Auth";
import type { RouterContext } from "@/routes/__root";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Create router with context type
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    queryClient,
  } as RouterContext,
});

// Type registration
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AspectRatioWrapper({ children }: { children: ReactElement }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="@container flex h-full w-full items-center justify-center border">
        {children}
      </div>
    </div>
  );
}

function InnerApp() {
  const auth = useContext(AuthContext);

  // Wait for contexts to load before rendering router
  if (auth.loading) {
    return <h1>Loading...</h1>;
  }

  return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
  return (
    // Just use standard patterns, otherwise you are making a footgun
    <QueryClientProvider client={queryClient}>
      {/* Auth Context only really exists in the browser, don't need to use Query. */}
      <AuthContextProvider>
        <AspectRatioWrapper>
          <InnerApp />
        </AspectRatioWrapper>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}

export default App;
