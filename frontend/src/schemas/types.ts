import type { UUIDTypes } from "uuid";

export type Color = "w" | "b";
export type PieceType = "p" | "r" | "n" | "b" | "q" | "k";

export interface BoardPosition {
  row: number;
  col: number;
}

export interface Move {
  start: BoardPosition;
  end: BoardPosition;
}

export interface Piece {
  type: PieceType;
  color: Color;
  hasMoved: boolean;
}

export type BoardPieces = (Piece | null)[][];

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


// Lobbies and such
export type LobbyId = string;
export type LobbyStatus = "active" | "pending";

export interface LobbyProfile {
  id: LobbyId;
  status: LobbyStatus;
  host: UserProfile;
  guest: UserProfile | null;
}


// Websocket packets !!!!
export type PacketType = "lobby_packet" | "game_packet"
export interface LobbyPacket {
  type: "lobby_packet"
  content: LobbyProfile
}

// TODO: handle this
export interface GamePacket {
  type: "game_packet"
  board: BoardPieces
}

export type Packet = LobbyPacket | GamePacket