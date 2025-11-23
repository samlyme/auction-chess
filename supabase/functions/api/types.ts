import { User } from "@supabase/supabase-js";
import { Tables } from "../_shared/database.types.ts"

// successful log in. 
export type AuthedEnv = {
  Variables: {
    user: User
  }
}
// Their profile is complete.
export type CompleteEnv = {
  Variables: AuthedEnv["Variables"] & { profile: Tables<'profiles'> }
}
// Validate lobby state.
export type LobbyEnv = {
    Variables: CompleteEnv["Variables"] & { lobby?: Tables<'lobbies'>}
}