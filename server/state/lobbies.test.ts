import { describe, expect, test, beforeEach, mock } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { LobbyEventType, type LobbyConfig } from "shared";
import {
  createLobby,
  joinLobby,
  leaveLobby,
  deleteLobby,
  startGame,
  endGame,
  getLobbyByCode,
  getLobbyByUserId,
} from "./lobbies.ts";

// Mock Supabase client with channel tracking
function createMockSupabase() {
  const channels = new Map<string, any>();
  const broadcasts = new Map<string, any[]>();

  const mockSupabase = {
    channel: mock((channelName: string) => {
      if (!channels.has(channelName)) {
        const channelBroadcasts: any[] = [];
        broadcasts.set(channelName, channelBroadcasts);

        const mockChannel = {
          httpSend: mock((eventType: string, payload: any) => {
            channelBroadcasts.push({ eventType, payload });
            return Promise.resolve();
          }),
        };
        channels.set(channelName, mockChannel);
      }
      return channels.get(channelName);
    }),
  } as unknown as SupabaseClient;

  return {
    supabase: mockSupabase,
    getBroadcasts: (channelName: string) => broadcasts.get(channelName) || [],
    clear: () => {
      channels.clear();
      broadcasts.clear();
    },
  };
}

describe("Lobby State Management", () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
  });

  describe("createLobby", () => {
    test("creates a new lobby with correct properties", () => {
      const userId = "user-123";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(userId, config, mockSupabase.supabase);

      expect(lobby.hostUid).toBe(userId);
      expect(lobby.guestUid).toBeNull();
      expect(lobby.gameState).toBeNull();
      expect(lobby.config).toEqual(config);
      expect(lobby.code).toHaveLength(6);
      expect(lobby.id).toBeDefined();
    });

    test("broadcasts lobby creation", () => {
      const userId = "user-123";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(userId, config, mockSupabase.supabase);
      const broadcasts = mockSupabase.getBroadcasts(`lobby-${lobby.code}`);

      expect(broadcasts).toHaveLength(1);
      expect(broadcasts[0].eventType).toBe(LobbyEventType.LobbyUpdate);
      expect(broadcasts[0].payload.code).toBe(lobby.code);
    });

    test("lobby is retrievable by code and user ID", () => {
      const userId = "user-123";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(userId, config, mockSupabase.supabase);

      expect(getLobbyByCode(lobby.code)).toEqual(lobby);
      expect(getLobbyByUserId(userId)).toEqual(lobby);
    });
  });

  describe("joinLobby", () => {
    test("joining new lobby while in another automatically leaves old lobby", () => {
      const user1 = "user-1";
      const user2 = "user-2";
      const user3 = "user-3";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      // Create two lobbies
      const lobby1 = createLobby(user1, config, mockSupabase.supabase);
      const lobby2 = createLobby(user2, config, mockSupabase.supabase);
      mockSupabase.clear();

      // User 3 joins lobby 1
      joinLobby(user3, lobby1.code, mockSupabase.supabase);
      mockSupabase.clear();

      // User 3 joins lobby 2 (should automatically leave lobby 1)
      // leaveLobby(user3, mockSupabase.supabase); // Simulating the leave in join route
      joinLobby(user3, lobby2.code, mockSupabase.supabase);

      // Verify broadcasts were sent to both lobbies
      const lobby1Broadcasts = mockSupabase.getBroadcasts(
        `lobby-${lobby1.code}`,
      );
      const lobby2Broadcasts = mockSupabase.getBroadcasts(
        `lobby-${lobby2.code}`,
      );

      expect(lobby1Broadcasts).toHaveLength(1);
      expect(lobby1Broadcasts[0].eventType).toBe(LobbyEventType.LobbyUpdate);
      expect(lobby1Broadcasts[0].payload.guestUid).toBeNull();

      expect(lobby2Broadcasts).toHaveLength(1);
      expect(lobby2Broadcasts[0].eventType).toBe(LobbyEventType.LobbyUpdate);
      expect(lobby2Broadcasts[0].payload.guestUid).toBe(user3);

      // Verify final state
      const finalLobby1 = getLobbyByCode(lobby1.code);
      const finalLobby2 = getLobbyByCode(lobby2.code);

      expect(finalLobby1?.guestUid).toBeNull();
      expect(finalLobby2?.guestUid).toBe(user3);
      expect(getLobbyByUserId(user3)).toEqual(finalLobby2);
    });
    test("adds guest to lobby", () => {
      const hostId = "host-123";
      const guestId = "guest-456";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      mockSupabase.clear(); // Clear creation broadcast

      joinLobby(guestId, lobby.code, mockSupabase.supabase);

      const updatedLobby = getLobbyByCode(lobby.code);
      expect(updatedLobby?.guestUid).toBe(guestId);
      expect(getLobbyByUserId(guestId)).toEqual(updatedLobby);
    });

    test("broadcasts when guest joins", () => {
      const hostId = "host-123";
      const guestId = "guest-456";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      mockSupabase.clear();

      joinLobby(guestId, lobby.code, mockSupabase.supabase);

      const broadcasts = mockSupabase.getBroadcasts(`lobby-${lobby.code}`);
      expect(broadcasts).toHaveLength(1);
      expect(broadcasts[0].eventType).toBe(LobbyEventType.LobbyUpdate);
      expect(broadcasts[0].payload.guestUid).toBe(guestId);
    });
  });

  describe("leaveLobby", () => {
    test("guest leaving sets guestUid to null", () => {
      const hostId = "host-123";
      const guestId = "guest-456";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      joinLobby(guestId, lobby.code, mockSupabase.supabase);
      mockSupabase.clear();

      leaveLobby(guestId, mockSupabase.supabase);

      const updatedLobby = getLobbyByCode(lobby.code);
      expect(updatedLobby?.guestUid).toBeNull();
      expect(getLobbyByUserId(guestId)).toBeUndefined();
    });

    test("broadcasts when guest leaves", () => {
      const hostId = "host-123";
      const guestId = "guest-456";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      joinLobby(guestId, lobby.code, mockSupabase.supabase);
      mockSupabase.clear();

      leaveLobby(guestId, mockSupabase.supabase);

      const broadcasts = mockSupabase.getBroadcasts(`lobby-${lobby.code}`);
      expect(broadcasts).toHaveLength(1);
      expect(broadcasts[0].eventType).toBe(LobbyEventType.LobbyUpdate);
      expect(broadcasts[0].payload.guestUid).toBeNull();
    });

    test("host leaving with no guest deletes lobby", () => {
      const hostId = "host-123";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      mockSupabase.clear();

      leaveLobby(hostId, mockSupabase.supabase);

      expect(getLobbyByCode(lobby.code)).toBeUndefined();
      expect(getLobbyByUserId(hostId)).toBeUndefined();
    });

    test("broadcasts lobby deletion when host leaves with no guest", () => {
      const hostId = "host-123";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      mockSupabase.clear();

      leaveLobby(hostId, mockSupabase.supabase);

      const broadcasts = mockSupabase.getBroadcasts(`lobby-${lobby.code}`);
      expect(broadcasts).toHaveLength(1);
      expect(broadcasts[0].eventType).toBe(LobbyEventType.LobbyDelete);
    });

    test("host leaving with guest promotes guest to host", () => {
      const hostId = "host-123";
      const guestId = "guest-456";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      joinLobby(guestId, lobby.code, mockSupabase.supabase);
      mockSupabase.clear();

      leaveLobby(hostId, mockSupabase.supabase);

      const updatedLobby = getLobbyByCode(lobby.code);
      expect(updatedLobby?.hostUid).toBe(guestId);
      expect(updatedLobby?.guestUid).toBeNull();
      expect(getLobbyByUserId(hostId)).toBeUndefined();
      expect(getLobbyByUserId(guestId)).toEqual(updatedLobby);
    });

    test("broadcasts when host leaves and guest is promoted", () => {
      const hostId = "host-123";
      const guestId = "guest-456";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      joinLobby(guestId, lobby.code, mockSupabase.supabase);
      mockSupabase.clear();

      leaveLobby(hostId, mockSupabase.supabase);

      const broadcasts = mockSupabase.getBroadcasts(`lobby-${lobby.code}`);
      expect(broadcasts).toHaveLength(1);
      expect(broadcasts[0].eventType).toBe(LobbyEventType.LobbyUpdate);
      expect(broadcasts[0].payload.hostUid).toBe(guestId);
      expect(broadcasts[0].payload.guestUid).toBeNull();
    });
  });

  describe("deleteLobby", () => {
    test("deletes lobby and removes user mappings", () => {
      const hostId = "host-123";
      const guestId = "guest-456";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      joinLobby(guestId, lobby.code, mockSupabase.supabase);
      mockSupabase.clear();

      deleteLobby(lobby.code, mockSupabase.supabase);

      expect(getLobbyByCode(lobby.code)).toBeUndefined();
      expect(getLobbyByUserId(hostId)).toBeUndefined();
      expect(getLobbyByUserId(guestId)).toBeUndefined();
    });

    test("broadcasts lobby deletion", () => {
      const hostId = "host-123";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      mockSupabase.clear();

      deleteLobby(lobby.code, mockSupabase.supabase);

      const broadcasts = mockSupabase.getBroadcasts(`lobby-${lobby.code}`);
      expect(broadcasts).toHaveLength(1);
      expect(broadcasts[0].eventType).toBe(LobbyEventType.LobbyDelete);
    });
  });

  describe("startGame", () => {
    test("initializes game state", () => {
      const hostId = "host-123";
      const guestId = "guest-456";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      joinLobby(guestId, lobby.code, mockSupabase.supabase);
      mockSupabase.clear();

      startGame(lobby.code, mockSupabase.supabase);

      const updatedLobby = getLobbyByCode(lobby.code);
      expect(updatedLobby?.gameState).not.toBeNull();
      expect(updatedLobby?.gameState).toBeDefined();
    });

    test("broadcasts game start", () => {
      const hostId = "host-123";
      const guestId = "guest-456";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      joinLobby(guestId, lobby.code, mockSupabase.supabase);
      mockSupabase.clear();

      startGame(lobby.code, mockSupabase.supabase);

      const broadcasts = mockSupabase.getBroadcasts(`lobby-${lobby.code}`);
      expect(broadcasts).toHaveLength(1);
      expect(broadcasts[0].eventType).toBe(LobbyEventType.LobbyUpdate);
      expect(broadcasts[0].payload.gameState).not.toBeNull();
    });
  });

  describe("endGame", () => {
    test("clears game state", () => {
      const hostId = "host-123";
      const guestId = "guest-456";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      joinLobby(guestId, lobby.code, mockSupabase.supabase);
      startGame(lobby.code, mockSupabase.supabase);
      mockSupabase.clear();

      endGame(lobby.code, mockSupabase.supabase);

      const updatedLobby = getLobbyByCode(lobby.code);
      expect(updatedLobby?.gameState).toBeNull();
    });

    test("broadcasts game end", () => {
      const hostId = "host-123";
      const guestId = "guest-456";
      const config: LobbyConfig = {
        gameConfig: { hostColor: "white", initTime: { white: 5, black: 5 } },
      };

      const lobby = createLobby(hostId, config, mockSupabase.supabase);
      joinLobby(guestId, lobby.code, mockSupabase.supabase);
      startGame(lobby.code, mockSupabase.supabase);
      mockSupabase.clear();

      endGame(lobby.code, mockSupabase.supabase);

      const broadcasts = mockSupabase.getBroadcasts(`lobby-${lobby.code}`);
      expect(broadcasts).toHaveLength(1);
      expect(broadcasts[0].eventType).toBe(LobbyEventType.LobbyUpdate);
      expect(broadcasts[0].payload.gameState).toBeUndefined();
    });
  });
});
