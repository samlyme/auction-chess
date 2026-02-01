import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import AuthContextProvider from "@/contexts/AuthContextProvider";
import { useContext, type ReactElement } from "react";
import { AuthContext } from "@/contexts/Auth";
import type { RouterContext } from "@/routes/__root";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

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

function AspectRatioWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div
        className="@container aspect-video max-w-full max-h-full flex items-center justify-center border"
        style={{
          width: 'min(100vw, 177.77dvh)',
        }}
      >
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
          <ReactQueryDevtools />
          <InnerApp />
        </AspectRatioWrapper>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}

export default App;
