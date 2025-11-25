import { User } from "@supabase/supabase-js";
import { Tables } from "../../../shared/database.types.ts";

// successful log in.
export type AuthedEnv = {
  Variables: {
    user: User;
  };
};

export type MaybeProfileEnv = {
  Variables: AuthedEnv["Variables"] & { profile?: Tables<"profiles"> };
};

// Their profile is complete.
export type CompleteProfileEnv = {
  Variables: AuthedEnv["Variables"] & { profile: Tables<"profiles"> };
};
// Validate lobby state.
export type LobbyEnv = {
  Variables: CompleteProfileEnv["Variables"] & { lobby?: Tables<"lobbies"> };
};
