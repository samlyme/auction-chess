import type { Session } from "@supabase/supabase-js";
import type { Profile } from "shared";

export type OnboardingStage = "unauthed" | "createProfile" | "complete";

export const stagePath: Readonly<Record<OnboardingStage, string>> = {
  unauthed: "/auth",
  createProfile: "/auth/create-profile",
  complete: "/lobbies",
};

export function getStage({
  session,
  profile,
}: {
  session: Session | null;
  profile: Profile | null;
}): OnboardingStage {
  if (!session) return "unauthed";
  if (!profile) return "createProfile";
  return "complete";
}
