import { useNavigate } from "react-router";
import type { LobbyId, LobbyProfile } from "../schemas/types";
import * as LobbyServices from "../services/lobbies";
import { useEffect } from "react";
import useAuth from "./useAuth";

interface UseLobbyReturn {
  userLobby: () => Promise<LobbyProfile | null>;
  getLobby: (lobbyId: LobbyId) => Promise<LobbyProfile>;
  createLobby: () => Promise<LobbyProfile | null>;
  startLobby: (lobbyId: LobbyId) => Promise<void>;
  deleteLobby: (lobbyId: LobbyId) => Promise<void>;
  leaveLobby: (lobbyId: LobbyId) => Promise<void>;
  joinLobby: (lobbyId: LobbyId) => Promise<LobbyProfile>;
}

function useLobbies(): UseLobbyReturn {
  const { token } = useAuth(); // notice that we need to use this hook in auth context
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token, navigate]);

  // make type checker happy
  if (!token) {
    return {
      userLobby: async () => null,
      getLobby: async () => {
        throw new Error("no auth");
      },
      createLobby: async () => null,
      startLobby: async () => {},
      deleteLobby: async () => {},
      leaveLobby: async () => {},
      joinLobby: async () => {
        throw new Error("no auth");
      },
    };
  }

  const userLobby = () => LobbyServices.userLobby(token);
  const getLobby = (lobbyId: LobbyId) => LobbyServices.getLobby(token, lobbyId);
  const createLobby = () => LobbyServices.createLobby(token);
  const startLobby = (lobbyId: LobbyId) =>
    LobbyServices.startLobby(token, lobbyId);
  const leaveLobby = (lobbyId: LobbyId) =>
    LobbyServices.leaveLobby(token, lobbyId);
  const joinLobby = (lobbyId: LobbyId) =>
    LobbyServices.joinLobby(token, lobbyId);
  const deleteLobby = (lobbyId: LobbyId) =>
    LobbyServices.deleteLobby(token, lobbyId);

  return {
    userLobby,
    getLobby,
    createLobby,
    startLobby,
    deleteLobby,
    joinLobby,
    leaveLobby,
  };
}

export default useLobbies;
