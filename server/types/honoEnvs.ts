import {
  RealtimeChannel,
  SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import type { TimingVariables } from "hono/timing";
import { AuctionChessState, Color, Lobby, Profile } from "shared";

export type BaseEnv = {
  Variables: TimingVariables & {
    supabase: SupabaseClient;
  };
};

// successful log in.
export type AuthedEnv = {
  Variables: BaseEnv["Variables"] & {
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
    playerColor: Color;
    receivedTime: number;
  }
}
