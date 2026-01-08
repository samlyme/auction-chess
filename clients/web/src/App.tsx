import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import AuthContextProvider from './components/providers/AuthContextProvider';
import { useContext, type ReactElement } from 'react';
import { AuthContext } from './contexts/Auth';
import type { RouterContext } from './routes/__root';

// Create router with context type
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  } as RouterContext,
});

// Type registration
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AspectRatioWrapper({ children }: { children: ReactElement }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="@container aspect-video w-full border">
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
    <AuthContextProvider>
      <AspectRatioWrapper>
        <InnerApp />
      </AspectRatioWrapper>
    </AuthContextProvider>
  );
}

export default App;
