import UserProfile from "./components/UserProfile"
import AuthContextProvider from "./components/AuthContextProvider"
import Auth from "./components/Auth"
import Lobby from "./components/Lobby"

function App() {

  return (
    <>
    <AuthContextProvider>
      <h1>User profile</h1>
      <Auth />
      <UserProfile />
      <Lobby />
    </AuthContextProvider>
    </>
  )
}

export default App
