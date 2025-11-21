// RequireAuth.jsx
import type React from "react";
import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../contexts/Auth";

export function RequireAuth({ children }: { children: React.ReactNode}) {
  const session = useContext(AuthContext);
  const location = useLocation();

  if (!session) {
    // Redirect them to the login page and save the location they were trying to go
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

export function RedirectIfAuth({ children }: { children: React.ReactNode}) {
  const session = useContext(AuthContext);
  
  return session ? <Navigate to="/home" replace /> : children;
}