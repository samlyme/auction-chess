import type { ReactNode } from "react";
import "./App.css"; // Optional: for basic styling
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/Auth";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Lobbies from "./pages/Lobbies";
import Lobby from "./pages/Lobby";

function App() {
  return (
    <Context>
      <Content/>
    </Context>
  )
}

function Context({ children }: { children: ReactNode}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
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
          <Route path="/lobbies/:lobbyId" element={<Lobby />}/>
          <Route path="/profile" element={<Profile />}/>
        </Routes>
      </BrowserRouter>
  );

}

export default App;
