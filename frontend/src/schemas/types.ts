import type { UUIDTypes } from "uuid";

// Users and such
export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserProfile {
  uuid: UUIDTypes;
  username: string;
  createAt: Date;
}

export interface UserCreate {
  username: string;
  password: string;
}

// Can add more JWT fields later
// Don't technically need this in frontend.
export interface JWTPayload {
  exp: Date;
  sub: UUIDTypes;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export type Color = "w" | "b";
export type PieceSymbol =
  | "p"
  | "r"
  | "n"
  | "b"
  | "q"
  | "k"
  | "P"
  | "R"
  | "N"
  | "B"
  | "Q"
  | "K";
export type GamePhase = "bid" | "move";
export type GameOutcome = Color | "draw" | null;

export type BoardPieces = (PieceSymbol | null)[][];
export type Move = string; // Must be valid UCI

export interface Bid {
  amount: number;
  fold: boolean;
}

// Lobbies and such
export type LobbyIdLength = 5;
export type LobbyId = string;
export type LobbyStatus = "active" | "pending";

export interface LobbyOptions {
  is_public: boolean;
}

export interface GameOptions {
  host_color: Color;
}

export interface LobbyProfile {
  id: LobbyId;
  status: LobbyStatus;
  host: UserProfile;
  guest: UserProfile | null;
  lobby_options: LobbyOptions;
  game_options: GameOptions;
}

// Websocket packets !!!!
export type PacketType = "lobby_packet" | "game_packet";
export interface LobbyPacket {
  type: "lobby_packet";
  content: LobbyProfile;
}

export type AuctionStyle =
  | "open_first"
  | "open_second"
  | "closed_first"
  | "closed_second"
  | "open-all"
  | "closed-all";
export type Players = Record<Color, UserProfile>;
export type Balances = Record<Color, number>;
export type OpenBidHistory = Bid[][];

export interface OpenFirst {
  auction_style: "open_first";
  bid_history: OpenBidHistory;
}

// TODO: This will become a union of all possible auction styles
export type AuctionData = OpenFirst;

export interface GameData {
  outcome: GameOutcome;

  phase: GamePhase;
  bid_turn: Color;
  turn: Color;

  board: BoardPieces;
  moves: Move[];

  players: Players;
  balances: Balances;

  auction_data: AuctionData;
}
// TODO: handle this
export interface GamePacket {
  type: "game_packet";

  content: GameData;
}

export type Packet = LobbyPacket | GamePacket;

// THIS SECTION IS CLIENT-EXCLUSIVE. THE UI NEEDS THIS.
export type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type BoardPosition = `${File}${Rank}`;
