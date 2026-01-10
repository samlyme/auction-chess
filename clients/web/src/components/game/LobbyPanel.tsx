import { startLobby, endLobby, deleteLobby, leaveLobby } from '../../services/lobbies';

interface LobbyPanelProps {
  isHost: boolean;
}

export default function LobbyPanel({ isHost }: LobbyPanelProps) {
  const handleStartLobby = async () => {
    const result = await startLobby();
    if (!result.ok) {
      console.error('Failed to start lobby:', result.error);
    }
  };

  const handleEndLobby = async () => {
    const result = await endLobby();
    if (!result.ok) {
      console.error('Failed to end lobby:', result.error);
    }
  };

  const handleDeleteLobby = async () => {
    const result = await deleteLobby();
    if (!result.ok) {
      console.error('Failed to delete lobby:', result.error);
    }
  };

  const handleLeaveLobby = async () => {
    const result = await leaveLobby();
    if (!result.ok) {
      console.error('Failed to leave lobby:', result.error);
    }
  };

  return (
    <div className="h-full w-full rounded-2xl bg-neutral-900 p-4">
      <div className="flex h-full w-full flex-col gap-4">
        <div className="flex-1 rounded-lg bg-neutral-800 p-4">
          <div className="flex h-full flex-col gap-4">
            <div className="rounded-md bg-neutral-700 p-4">
              <h2 className="mb-4 text-center text-2xl">Lobby Controls</h2>

              {isHost ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleStartLobby}
                    className="w-full cursor-pointer rounded bg-green-400 px-4 py-3 text-xl hover:bg-green-300"
                  >
                    Start Game
                  </button>
                  <button
                    onClick={handleEndLobby}
                    className="w-full cursor-pointer rounded bg-yellow-400 px-4 py-3 text-xl hover:bg-yellow-300"
                  >
                    End Game
                  </button>
                  <button
                    onClick={handleDeleteLobby}
                    className="w-full cursor-pointer rounded bg-red-400 px-4 py-3 text-xl hover:bg-red-300"
                  >
                    Delete Lobby
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleLeaveLobby}
                    className="w-full cursor-pointer rounded bg-red-400 px-4 py-3 text-xl hover:bg-red-300"
                  >
                    Leave Lobby
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
