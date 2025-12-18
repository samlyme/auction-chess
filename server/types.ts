import {
  RealtimeChannel,
  SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import { AuctionChessState, Color, Lobby, Profile } from "shared";

export type SupabaseEnv = {
  Variables: {
    supabase: SupabaseClient;
  };
};

// successful log in.
export type AuthedEnv = {
  Variables: SupabaseEnv["Variables"] & {
    user: User;
  };
};

export type MaybeProfileEnv = {
  Variables: AuthedEnv["Variables"] & { profile?: Profile };
};

// Their profile is complete.
export type CompleteProfileEnv = {
  Variables: AuthedEnv["Variables"] & { profile: Profile };
};
// Validate lobby state.
export type MaybeLobbyEnv = {
  Variables: CompleteProfileEnv["Variables"] & { lobby?: Lobby };
};
export type LobbyEnv = {
  Variables: CompleteProfileEnv["Variables"] & {
    lobby: Lobby;
    channel: RealtimeChannel;
    deleted: boolean;
  };
};

// TODO: make MaybeGameEnv
export type GameEnv = {
  Variables: LobbyEnv["Variables"] & {
    gameState: AuctionChessState;
    playerColor: Color
  }
}
