import { Navigate, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";
import type { ReactNode } from "react";

function AuthGaurd({ children }: { children: ReactNode}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/auth"
        state={{ from: location }}
      />
    );
  }

  return children;
}

export default AuthGaurd;