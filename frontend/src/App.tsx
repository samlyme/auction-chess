import type { ReactNode } from "react";
import "./App.css"; // Optional: for basic styling
import Auth from "./pages/Auth";
import { AuthProvider } from "./components/providers/AuthProvider";
import { BrowserRouter, Route, Routes, useParams } from "react-router";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Lobbies from "./pages/Lobbies";
import Lobby from "./pages/Lobby";
import { ServerUpdatesProvider } from "./components/providers/ServerUpdatesProvider";
import LayoutWithHeader from "./layouts/LayoutWithHeader";
import { AspectRatio } from "radix-ui";

function App() {
  return (
    // The wrapper divs are used for the sizing.
    <div className="app">
        <MainContext>
          <Content />
        </MainContext>
    </div>
  );
}

function MainContext({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function ServerUpdatesContext({ children }: { children: ReactNode }) {
  const { lobbyId } = useParams();
  return (
    <ServerUpdatesProvider lobbyId={lobbyId!}>{children}</ServerUpdatesProvider>
  );
}

function Content() {
  return (
    <AspectRatio.Root ratio={16 / 9}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route element={<LayoutWithHeader />}>
            <Route path="/lobbies" element={<Lobbies />} />

            <Route
              path="/lobbies/:lobbyId"
              element={
                <ServerUpdatesContext>
                  <Lobby />
                </ServerUpdatesContext>
              }
            />

            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AspectRatio.Root>
  );
}

export default App;
