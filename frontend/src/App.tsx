import "./App.css"; // Optional: for basic styling
import Board from "./components/Board";
import Login from "./components/Login";
import { useAuthContext } from "./contexts/Auth";

function App() {
  const { token, logout } = useAuthContext()

  return (
      <div className="app">
        <button onClick={logout}>Logout</button>
        {token ? <Board /> : <Login />}
      </div>
  );
}

export default App;
