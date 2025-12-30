import "./index.css";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import AuthContextProvider from "./components/providers/AuthContextProvider";
import UserProfileContextProvider from "./components/providers/UserProfileContextProvider";
import { useContext } from "react";
import { AuthContext } from "./contexts/Auth";
import { UserProfileContext } from "./contexts/UserProfile";
import type { RouterContext } from "./routes/__root";

// Create router with context type
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    profile: undefined!,
  } as RouterContext,
});

// Type registration
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useContext(AuthContext);
  const profile = useContext(UserProfileContext);

  // Wait for contexts to load before rendering router
  if (auth.loading || profile.loading) {
    return <h1>Loading...</h1>;
  }

  return <RouterProvider router={router} context={{ auth, profile }} />;
}

function App() {
  return (
    <AuthContextProvider>
      <UserProfileContextProvider>
        <InnerApp />
      </UserProfileContextProvider>
    </AuthContextProvider>
  );
}

export default App;
