import type { LobbyPayload } from 'shared';
import {
  useStartLobbyMutation,
  useEndLobbyMutation,
  useDeleteLobbyMutation,
  useLeaveLobbyMutation,
} from '@/hooks/queries/lobbies';

interface LobbyPanelProps {
  isHost: boolean;
  lobby: LobbyPayload;
}

export default function LobbyPanel({ isHost, lobby }: LobbyPanelProps) {
  const startLobbyMutation = useStartLobbyMutation();
  const endLobbyMutation = useEndLobbyMutation();
  const deleteLobbyMutation = useDeleteLobbyMutation();
  const leaveLobbyMutation = useLeaveLobbyMutation();

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
                <button
                  onClick={handleCopyCode}
                  className="w-full cursor-pointer rounded bg-purple-400 px-4 py-2 text-base hover:bg-purple-300"
                >
                  Copy Code
                </button>
              </div>

              {isHost ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleStartLobby}
                    disabled={startLobbyMutation.isPending}
                    className="w-full cursor-pointer rounded bg-green-400 px-4 py-3 text-xl hover:bg-green-300 disabled:bg-neutral-400"
                  >
                    {startLobbyMutation.isPending
                      ? 'Starting...'
                      : 'Start Game'}
                  </button>
                  <button
                    onClick={handleEndLobby}
                    disabled={endLobbyMutation.isPending}
                    className="w-full cursor-pointer rounded bg-yellow-400 px-4 py-3 text-xl hover:bg-yellow-300 disabled:bg-neutral-400"
                  >
                    {endLobbyMutation.isPending ? 'Ending...' : 'End Game'}
                  </button>
                  <button
                    onClick={handleDeleteLobby}
                    disabled={deleteLobbyMutation.isPending}
                    className="w-full cursor-pointer rounded bg-red-400 px-4 py-3 text-xl hover:bg-red-300 disabled:bg-neutral-400"
                  >
                    {deleteLobbyMutation.isPending
                      ? 'Deleting...'
                      : 'Delete Lobby'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleLeaveLobby}
                    disabled={leaveLobbyMutation.isPending}
                    className="w-full cursor-pointer rounded bg-red-400 px-4 py-3 text-xl hover:bg-red-300 disabled:bg-neutral-400"
                  >
                    {leaveLobbyMutation.isPending
                      ? 'Leaving...'
                      : 'Leave Lobby'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
