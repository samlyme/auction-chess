// RequireAuth.jsx
import type React from "react";
import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../contexts/Auth";
import { UserProfileContext } from "../contexts/UserProfile";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading)
    return (
      <>
        <h1>Loading user auth session...</h1>
      </>
    );
  if (!session) {
    // Redirect them to the login page and save the location they were trying to go
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useContext(AuthContext);
  const { profile, loading: profileLoading } = useContext(UserProfileContext);
  const location = useLocation();

  if (authLoading)
    return (
      <>
        <h1>Loading user auth session...</h1>
      </>
    );
  if (profileLoading) return <h1>Loading user profile</h1>;

  if (!session) return children;
  if (!session.user.confirmed_at) {
    return location.pathname !== "/auth/email-confirmation" ? (
      <Navigate to="/auth/email-confirmation" replace />
    ) : (
      children
    );
  }
  if (!profile) {
    console.log("going to create profile");

    return location.pathname !== "/auth/create-profile" ? (
      <Navigate to="/auth/create-profile" replace />
    ) : (
      children
    );
  }

  return <Navigate to={location.state?.from?.pathname || "/home"} replace />;
}

/* 
There are 3 layers to the auth:
1. Successful Sign In, no email conf -> AuthContext returns valid user object, but null session
2. Successful Sign In, email conf -> AuthContext returns valid user object, and valid session
3. Successful Sign In, email conf, no user profile -> Auth Context returns valid user object, and valid session, but UserProfileContext fails.
4. Successful Sign In, email conf, yes user profile -> Both contexts return valid objects!

flow:
1. Sign up.
2. Email Conf.
3. Profile Create.
4. Enjoy.

Profile can't be created without email conf. Enforced at Supabase RLS level.
*/
