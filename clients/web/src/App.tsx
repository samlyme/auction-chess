import "./index.css";
import AuthContextProvider from "./components/providers/AuthContextProvider";
import Auth from "./pages/Auth";
import { BrowserRouter, Route, Routes } from "react-router";
import Splash from "./pages/Splash";
import Lobbies from "./pages/Lobbies";
import OnboardingGuard from "./components/OnboardingGuard";
import UserProfile from "./pages/UserProfile";
import UserProfileContextProvider from "./components/providers/UserProfileContextProvider";
import CreateUserProfile from "./pages/CreateUserProfile";

function App() {
  return (
    <>
      <AuthContextProvider>
        <UserProfileContextProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <OnboardingGuard allow={"unauthed"}>
                    <Splash />
                  </OnboardingGuard>
                }
              />
              <Route
                path="/auth"
                element={
                  <OnboardingGuard allow={"unauthed"}>
                    <Auth />
                  </OnboardingGuard>
                }
              />
              <Route
                path="/auth/create-profile"
                element={
                  <OnboardingGuard allow={"createProfile"}>
                    <CreateUserProfile />
                  </OnboardingGuard>
                }
              />
              <Route
                path="/lobbies"
                element={
                  <OnboardingGuard allow={"complete"}>
                    <Lobbies />
                  </OnboardingGuard>
                }
              />
              <Route
                path="/profile/me"
                element={
                  <OnboardingGuard allow={"complete"}>
                    <UserProfile />
                  </OnboardingGuard>
                }
              />
            </Routes>
          </BrowserRouter>
        </UserProfileContextProvider>
      </AuthContextProvider>
    </>
  );
}

export default App;
