import AuthContextProvider from "./components/AuthContextProvider";
import Auth from "./pages/Auth";
import { BrowserRouter, Route, Routes } from "react-router";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import { RedirectIfAuth, RequireAuth } from "./components/AuthGuards";

function App() {
  return (
    <>
      <AuthContextProvider>
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
              path="/home"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthContextProvider>
    </>
  );
}

export default App;
