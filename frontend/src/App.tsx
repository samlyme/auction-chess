import type { ReactNode } from "react";
import "./App.css"; // Optional: for basic styling
import Board from "./components/Board";
import Auth from "./components/Auth";
import { AuthProvider, useAuthContext } from "./contexts/Auth";

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
  const { token, logout } = useAuthContext()

  return (
      <div className="app">
        <button onClick={logout}>Logout</button>
        {token ? <Board /> : <Auth />}
      </div>
  );

}

export default App;
