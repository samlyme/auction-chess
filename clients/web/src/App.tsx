import AuthContextProvider from "./components/AuthContextProvider";
import Auth from "./pages/Auth";
import { BrowserRouter, Route, Routes } from "react-router";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import { RedirectIfAuth, RequireAuth } from "./components/AuthGuards";
import UserProfile from "./pages/UserProfile";
import UserProfileContextProvider from "./components/UserProfileContextProvider";
import EmailConfirmation from "./pages/EmailConfirmation";

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
                  <RedirectIfAuth>
                    <Splash />
                  </RedirectIfAuth>
                }
              />
              <Route
                path="/auth"
                element={
                  <RedirectIfAuth>
                    <Auth />
                  </RedirectIfAuth>
                }
              />
              <Route
                path="/auth/email-confirmation"
                element={
                  <EmailConfirmation />
                }
              />
              <Route
                path="/home"
                element={
                  <RequireAuth>
                    <Home />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile/me"
                element={
                  <RequireAuth>
                    <UserProfile />
                  </RequireAuth>
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
