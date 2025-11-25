// RequireAuth.jsx
import type React from "react";
import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../contexts/Auth";
import { UserProfileContext } from "../contexts/UserProfile";
import type { Session } from "@supabase/supabase-js";
import type { Tables } from "../supabase";

export type OnboardingStage = "unauthed"  | "createProfile" | "complete";

const stagePath: Readonly<Record<OnboardingStage, string>> = {
  "unauthed": "/auth",
  "createProfile": "/auth/create-profile",
  "complete": "/lobbies"
}

function getStage({ session, profile }: { session: Session | null, profile: Tables<'profiles'> | null}): OnboardingStage {
  if (!session) return "unauthed";
  if (!profile) return "createProfile";
  return "complete";
}


export default function OnboardingGuard({
  children,
  allow,
  loadingFallback = <h1>Loading...</h1>
}: {
  children: React.ReactNode,
  allow: OnboardingStage,
  loadingFallback?: React.ReactNode,
}) {
  const { session, loading: authLoading } = useContext(AuthContext);
  const { profile, loading: profileLoading } = useContext(UserProfileContext);
  const location = useLocation();

  if (authLoading || profileLoading) return loadingFallback;

  const stage = getStage({ session, profile });

  // Make this somehow preserve where the user was at through refresh.
  const target = stagePath[stage];
  if (allow === stage || location.pathname === target) return children
  return <Navigate to={target} state={{from: location.pathname}} replace />;
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
