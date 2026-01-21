import {
  useDeleteLobbyMutationOptions,
  useEndLobbyMutationOptions,
  useLeaveLobbyMutationOptions,
  useStartLobbyMutationOptions,
} from "@/queries/lobbies";
import { useMutation } from "@tanstack/react-query";
import LobbyConfigForm from "../forms/LobbyConfigForm";
import LobbyConfigDisplay from "./LobbyConfigDisplay";
import type { LobbyPayload } from "shared/types/lobbies";
import { Button } from "@/components/ui";

interface LobbyPanelProps {
  isHost: boolean;
  lobby: LobbyPayload;
}

export default function LobbyPanel({ isHost, lobby }: LobbyPanelProps) {
  const startLobbyMutation = useMutation(useStartLobbyMutationOptions());
  const endLobbyMutation = useMutation(useEndLobbyMutationOptions());
  const deleteLobbyMutation = useMutation(useDeleteLobbyMutationOptions());
  const leaveLobbyMutation = useMutation(useLeaveLobbyMutationOptions());

  const handleStartLobby = async () => {
    await startLobbyMutation.mutateAsync();
  };

  const handleEndLobby = async () => {
    await endLobbyMutation.mutateAsync();
  };

  const handleDeleteLobby = async () => {
    await deleteLobbyMutation.mutateAsync();
  };

  const handleLeaveLobby = async () => {
    await leaveLobbyMutation.mutateAsync();
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(lobby.code);
  };

  const { gameStarted } = lobby;

  return (
    <div className="h-full w-full rounded-2xl bg-neutral-900 p-4">
      <div className="flex h-full w-full flex-col gap-4">
        <div className="flex-1 rounded-lg bg-neutral-800 p-4">
          <div className="flex h-full flex-col gap-4">
            <div className="rounded-md bg-neutral-700 p-4">
              <h2 className="mb-4 text-center text-2xl">Lobby Controls</h2>

              {/* Lobby Code */}
              <div className="mb-4 flex flex-col gap-2">
                <div className="rounded bg-neutral-600 p-3 text-center">
                  <p className="mb-1 text-sm text-neutral-400">Lobby Code</p>
                  <p className="font-mono text-2xl font-bold tracking-wider">
                    {lobby.code}
                  </p>
                </div>
                <Button
                  onClick={handleCopyCode}
                  variant="purple"
                  fullWidth
                >
                  Copy Code
                </Button>
              </div>

              {isHost ? (
                <div className="flex flex-col gap-3">
                  {!gameStarted ? (
                    <>
                      <div className={`max-h-110 overflow-y-auto rounded bg-neutral-600 p-4`}>
                        <LobbyConfigForm
                          isCreate={false}
                          initConfig={lobby.config}
                        />
                      </div>
                      <Button
                        onClick={handleStartLobby}
                        disabled={!lobby.guestUid}
                        variant="green"
                        size="xl"
                        fullWidth
                        loading={startLobbyMutation.isPending}
                        loadingText="Starting..."
                      >
                        Start Game
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="max-h-110 overflow-y-auto rounded bg-neutral-600 p-4">
                        <LobbyConfigDisplay config={lobby.config} />
                      </div>
                      <Button
                        onClick={handleEndLobby}
                        variant="yellow"
                        size="xl"
                        fullWidth
                        loading={endLobbyMutation.isPending}
                        loadingText="Ending..."
                      >
                        End Game
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={handleDeleteLobby}
                    variant="red"
                    size="xl"
                    fullWidth
                    loading={deleteLobbyMutation.isPending}
                    loadingText="Deleting..."
                  >
                    Delete Lobby
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="max-h-110 overflow-y-auto rounded bg-neutral-600 p-4">
                    <LobbyConfigDisplay config={lobby.config} />
                  </div>
                  <Button
                    onClick={handleLeaveLobby}
                    variant="red"
                    size="xl"
                    fullWidth
                    loading={leaveLobbyMutation.isPending}
                    loadingText="Leaving..."
                  >
                    Leave Lobby
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
