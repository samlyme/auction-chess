import { describe, test, expect, beforeEach } from "bun:test";
import {
  createLobby,
  getLobbyByCode,
  getLobbyByUserId,
  joinLobby,
  leaveLobby,
  deleteLobby,
  startGame,
  endGame,
  updateGameState,
} from "./lobbies";
import { createGame } from "shared/game/auctionChess";

// Note: Since lobbies uses in-memory state, we need to be careful about test isolation
// The lobbies Map is shared across tests, so we clean up after each test

describe("Lobby State Management", () => {
  const testUserId = "user-123";
  const testGuestId = "guest-456";

  // Helper to clean up lobbies created during tests
  beforeEach(() => {
    // Clean up any existing lobbies from previous tests
    const existingLobby = getLobbyByUserId(testUserId);
    if (existingLobby) {
      deleteLobby(existingLobby.code);
    }
    const existingGuestLobby = getLobbyByUserId(testGuestId);
    if (existingGuestLobby) {
      deleteLobby(existingGuestLobby.code);
    }
  });

  describe("createLobby", () => {
    test("creates lobby with correct default config", () => {
      const lobby = createLobby(testUserId);

      expect(lobby.hostUid).toBe(testUserId);
      expect(lobby.guestUid).toBe(null);
      expect(lobby.gameState).toBe(null);
      expect(lobby.config).toEqual({ hostColor: "white" });
      expect(lobby.code).toMatch(/^[A-Z2-9]{6}$/); // 6 char alphanumeric
      expect(lobby.id).toBeTruthy();
      expect(lobby.createdAt).toBeTruthy();

      // Cleanup
      deleteLobby(lobby.code);
    });

    test("creates lobby with custom config", () => {
      const lobby = createLobby(testUserId, { hostColor: "black" });

      expect(lobby.config).toEqual({ hostColor: "black" });

      // Cleanup
      deleteLobby(lobby.code);
    });

    test("generates unique codes", () => {
      const lobby1 = createLobby(testUserId);
      const lobby2 = createLobby("user-999");

      expect(lobby1.code).not.toBe(lobby2.code);

      // Cleanup
      deleteLobby(lobby1.code);
      deleteLobby(lobby2.code);
    });

    test("code excludes ambiguous characters", () => {
      const lobby = createLobby(testUserId);

      // Should not contain I, O, 0, 1 (ambiguous characters)
      expect(lobby.code).not.toMatch(/[IO01]/);

      // Cleanup
      deleteLobby(lobby.code);
    });
  });

  describe("getLobbyByCode", () => {
    test("returns lobby when it exists", () => {
      const created = createLobby(testUserId);

      const found = getLobbyByCode(created.code);

      expect(found).toBeDefined();
      expect(found?.code).toBe(created.code);

      // Cleanup
      deleteLobby(created.code);
    });

    test("returns undefined when lobby does not exist", () => {
      const found = getLobbyByCode("NONEXISTENT");

      expect(found).toBeUndefined();
    });
  });

  describe("getLobbyByUserId", () => {
    test("returns lobby when user is host", () => {
      const created = createLobby(testUserId);

      const found = getLobbyByUserId(testUserId);

      expect(found).toBeDefined();
      expect(found?.code).toBe(created.code);

      // Cleanup
      deleteLobby(created.code);
    });

    test("returns lobby when user is guest", () => {
      const created = createLobby(testUserId);
      joinLobby(testGuestId, created.code);

      const found = getLobbyByUserId(testGuestId);

      expect(found).toBeDefined();
      expect(found?.code).toBe(created.code);

      // Cleanup
      deleteLobby(created.code);
    });

    test("returns undefined when user is not in any lobby", () => {
      const found = getLobbyByUserId("unknown-user");

      expect(found).toBeUndefined();
    });
  });

  describe("joinLobby", () => {
    test("adds guest to lobby", () => {
      const lobby = createLobby(testUserId);

      joinLobby(testGuestId, lobby.code);

      const updated = getLobbyByCode(lobby.code);
      expect(updated?.guestUid).toBe(testGuestId);

      // Verify guest can find lobby
      const guestLobby = getLobbyByUserId(testGuestId);
      expect(guestLobby?.code).toBe(lobby.code);

      // Cleanup
      deleteLobby(lobby.code);
    });
  });

  describe("leaveLobby", () => {
    test("removes guest from lobby", () => {
      const lobby = createLobby(testUserId);
      joinLobby(testGuestId, lobby.code);

      leaveLobby(testGuestId);

      const updated = getLobbyByCode(lobby.code);
      expect(updated?.guestUid).toBe(null);

      const guestLobby = getLobbyByUserId(testGuestId);
      expect(guestLobby).toBeUndefined();

      // Cleanup
      deleteLobby(lobby.code);
    });
  });

  describe("deleteLobby", () => {
    test("removes lobby and clears user mappings", () => {
      const lobby = createLobby(testUserId);
      joinLobby(testGuestId, lobby.code);

      deleteLobby(lobby.code);

      expect(getLobbyByCode(lobby.code)).toBeUndefined();
      expect(getLobbyByUserId(testUserId)).toBeUndefined();
      expect(getLobbyByUserId(testGuestId)).toBeUndefined();
    });

    test("works when lobby has no guest", () => {
      const lobby = createLobby(testUserId);

      deleteLobby(lobby.code);

      expect(getLobbyByCode(lobby.code)).toBeUndefined();
      expect(getLobbyByUserId(testUserId)).toBeUndefined();
    });
  });

  describe("startGame", () => {
    test("initializes game state", () => {
      const lobby = createLobby(testUserId);

      startGame(lobby.code);

      const updated = getLobbyByCode(lobby.code);
      expect(updated?.gameState).toBeDefined();
      expect(updated?.gameState?.phase).toBe("bid");
      expect(updated?.gameState?.turn).toBe("white");
      expect(updated?.gameState?.auctionState.balance).toEqual({
        white: 1000,
        black: 1000,
      });

      // Cleanup
      deleteLobby(lobby.code);
    });
  });

  describe("endGame", () => {
    test("clears game state", () => {
      const lobby = createLobby(testUserId);
      startGame(lobby.code);

      endGame(lobby.code);

      const updated = getLobbyByCode(lobby.code);
      expect(updated?.gameState).toBe(null);

      // Cleanup
      deleteLobby(lobby.code);
    });
  });

  describe("updateGameState", () => {
    test("updates game state with new state", () => {
      const lobby = createLobby(testUserId);
      startGame(lobby.code);

      const newGameState = createGame();
      newGameState.turn = "black";
      newGameState.phase = "move";

      updateGameState(lobby.code, newGameState);

      const updated = getLobbyByCode(lobby.code);
      expect(updated?.gameState?.turn).toBe("black");
      expect(updated?.gameState?.phase).toBe("move");

      // Cleanup
      deleteLobby(lobby.code);
    });
  });
});
