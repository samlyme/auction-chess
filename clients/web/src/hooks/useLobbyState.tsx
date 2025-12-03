import { useEffect, useReducer } from "react";
import {  LobbyEventType, Lobby } from "shared";
import { getLobby } from "../services/lobbies";
import supabase from "../supabase";

// TODO: separate the Lobby and Game states so you don't rerender and hit the
// profiles API's every time a move is made.
// State shape
interface LobbyState {
  lobby: Lobby | null;
  loading: boolean;
}

// Action types
type LobbyAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_LOBBY"; payload: Lobby | null }
  | { type: "LOBBY_UPDATE"; payload: Lobby }
  | { type: "LOBBY_DELETE" };

// NOTE: always trust the broadcast data. The DB read data may be out of date
// due to a delay in Postgres UPDATE. This is a race condition! Avoid that by
// treating the updates as an "ultimate source of truth".
// Some weirdness can occur if a client subscribes before the final persistance
// is completed.

// Reducer function
function lobbyReducer(state: LobbyState, action: LobbyAction): LobbyState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_LOBBY":
      return {
        ...state,
        lobby: action.payload,
        loading: false,
      };

    case "LOBBY_UPDATE":
      // Update both lobby and game state from the lobby update
      return {
        ...state,
        lobby: action.payload,
      };

    case "LOBBY_DELETE":
      return {
        ...state,
        lobby: null,
      };

    default:
      return state;
  }
}

// Initial state
const initialState: LobbyState = {
  lobby: null,
  loading: true,
};

export default function useLobbyState() {
  const [state, dispatch] = useReducer(lobbyReducer, initialState);

  const [subFlag, setSubFlag] = useReducer((x) => x + 1, 0);

  // Initial fetch
  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    getLobby().then((result) => {
      if (result.ok) {
        dispatch({ type: "SET_LOBBY", payload: result.value });
      } else {
        console.log("Error fetching lobby:", result.error);
        dispatch({ type: "SET_LOBBY", payload: null });
      }
    });
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (state.loading || !state.lobby) return;

    console.log("subscribe to realtime");

    const channel = supabase.channel(`lobby-${state.lobby.code}`).subscribe();

    channel.on("broadcast", { event: "*" }, (update) => {
      console.log("real time", update);

      switch (update.event) {
        case LobbyEventType.Delete:
          dispatch({ type: "LOBBY_DELETE" });
          console.log("lobby deleted");
          break;

        case LobbyEventType.Update:
          const updatedLobby = Lobby.parse(update.payload);
          dispatch({ type: "LOBBY_UPDATE", payload: updatedLobby });
          console.log("lobby updated", updatedLobby);
          break;

        default:
          console.log("Unknown event type:", update.event);
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [subFlag, state.loading]);

  // Update function for manual updates
  const update = (lobby?: Lobby | null) => {
    if (lobby === undefined) {
      // Refetch from server
      dispatch({ type: "SET_LOADING", payload: true });
      getLobby().then((result) => {
        if (result.ok) {
          dispatch({ type: "SET_LOBBY", payload: result.value });
        } else {
          console.log("Error fetching lobby:", result.error);
          dispatch({ type: "SET_LOBBY", payload: null });
        }
        setSubFlag();
      });
    } else {
      // Direct update
      dispatch({ type: "SET_LOBBY", payload: lobby });
    }
  };

  return {
    lobby: state.lobby,
    loading: state.loading,
    update,
  };
}
