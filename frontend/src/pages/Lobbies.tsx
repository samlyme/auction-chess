import { useEffect } from 'react';
import type { LobbyProfile } from '../schemas/types';
import { useNavigate } from 'react-router';
import useLobbies from '../hooks/useLobbies';
import { Tabs } from 'radix-ui';

function Lobbies() {
  const navigate = useNavigate();

  const { userLobby, createLobby } = useLobbies();

  useEffect(() => {
    userLobby().then((lobby: LobbyProfile | null) => {
      if (lobby) {
        console.log('user lobby', lobby);
        navigate(`/lobbies/${lobby.id}`);
      }
    });
  }, [navigate, userLobby]);

 const handleCreate = () => {
    createLobby().then((res: LobbyProfile | null) => {
      console.log('Created lobby:', res);
      if (res) {
        navigate(`/lobbies/${res.id}`);
      }
    });
  };

  return (
    <Tabs.Root defaultValue="create" className="">
      <Tabs.List className="flex w-full justify-center space-x-4">
        <Tabs.Trigger value="create">Create Lobby</Tabs.Trigger>
        <Tabs.Trigger value="join">Join Lobby</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="create">
        <CreateLobbyMenu handleCreate={handleCreate} />
      </Tabs.Content>
      <Tabs.Content value="join">
        <JoinLobbyMenu />
      </Tabs.Content>
    </Tabs.Root>
  );
}

function CreateLobbyMenu({ handleCreate }: { handleCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-7 p-7">
      <h3>lobby options go here</h3>
      <button
        className="rounded bg-green-500 px-4 py-2 text-white"
        onClick={handleCreate}
      >
        Create Lobby
      </button>
    </div>
  );
}

function JoinLobbyMenu() {
  // TODO: fix this entire component lol function JoinLobbyMenu() {
  const { joinLobby } = useLobbies();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const lobbyCode = formData.get('lobbyId');
    joinLobby(String(lobbyCode!));
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-7 p-7">
      <form onSubmit={handleSubmit}>
        <input className="m-2 rounded border-2 bg-gray-300" type="text" />
        <button type="submit" className='rounded bg-green-500 px-4 py-2 text-white'>Join</button>
      </form>
    </div>
  );
}
export default Lobbies;
