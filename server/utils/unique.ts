import type { Lobby } from "shared/types/lobbies";

export function generateUniqueCode(lobbies: Record<string, Lobby>): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (!(code in lobbies)) return code;
  }
  throw new Error("Failed to generate unique lobby code");
}

// export function generateUniqueUsername(existingUsernames: string[])
