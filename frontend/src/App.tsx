import type { ReactNode } from "react";
import "./App.css"; // Optional: for basic styling
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/Auth";
import { BrowserRouter, Route, Routes, useParams } from "react-router";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Lobbies from "./pages/Lobbies";
import Lobby from "./pages/Lobby";
import { ServerUpdatesProvider } from "./contexts/ServerUpdates";

function App() {
  return (
    <MainContext>
      <Content/>
    </MainContext>
  )
}

function MainContext({ children }: { children: ReactNode}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

function ServerUpdatesContext({ children }: { children: ReactNode }) {
  const {lobbyId} = useParams()
  return (
    <ServerUpdatesProvider lobbyId={lobbyId!}>
      {children}
    </ServerUpdatesProvider>
  )
}

function Content() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/home" element={<Home />}/>
          <Route path="/auth" element={<Auth />}/>
          <Route path="/lobbies" element={<Lobbies />}/>
          <Route path="/lobbies/:lobbyId" element={
            <ServerUpdatesContext>
              <Lobby />
            </ServerUpdatesContext>
          }/>
          <Route path="/profile" element={<Profile />}/>
        </Routes>
      </BrowserRouter>
  );

}

export default App;
