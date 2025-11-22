import AuthContextProvider from "./components/AuthContextProvider";
import Auth from "./pages/Auth";
import { BrowserRouter, Route, Routes } from "react-router";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import OnboardingGuard from "./components/OnboardingGuard";
import UserProfile from "./pages/UserProfile";
import UserProfileContextProvider from "./components/UserProfileContextProvider";
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
                path="/home"
                element={
                  <OnboardingGuard allow={"complete"}>
                    <Home />
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
