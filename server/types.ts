import { RealtimeChannel, SupabaseClient, type User } from "@supabase/supabase-js";
import { type Tables } from "shared";

export type SupabaseEnv = {
  Variables: {
    supabase: SupabaseClient,
  }
}

// successful log in.
export type AuthedEnv = {
  Variables: SupabaseEnv["Variables"] & {
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
export type MaybeLobbyEnv = {
  Variables: CompleteProfileEnv["Variables"] & { lobby?: Tables<"lobbies"> };
};
export type LobbyEnv = {
  Variables: CompleteProfileEnv["Variables"] & {
    lobby: Tables<"lobbies">;
    channel: RealtimeChannel;
    deleted: boolean;
  };
};
