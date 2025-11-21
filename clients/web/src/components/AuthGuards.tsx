// RequireAuth.jsx
import type React from "react";
import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../contexts/Auth";

export function RequireAuth({ children }: { children: React.ReactNode}) {
  const {session, loading} = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <><h1>Loading user auth session...</h1></>
  if (!session) {
    // Redirect them to the login page and save the location they were trying to go
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const {session, loading} = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <><h1>Loading user auth session...</h1></>
  if (!session) return children;

  if (!session.user.confirmed_at) return <Navigate to="/email-confirmation" replace />


  
  return  <Navigate to={location.state?.from?.path || "/home"} replace />;
}