import { useEffect } from "react";
import type { LobbyProfile } from "../schemas/types";
import { useNavigate } from "react-router";
import useLobbies from "../hooks/useLobbies";
import { Form } from "radix-ui";
import useAuth from "../hooks/useAuth";

function Lobbies() {
  const navigate = useNavigate();


  const { userLobby, createLobby } = useLobbies();

  useEffect(() => {
    userLobby().then((lobby: LobbyProfile | null) => {
      if (lobby) {
        console.log("user lobby", lobby);
        navigate(`/lobbies/${lobby.id}`);
      }
    });
  }, [navigate, userLobby]);

  const handleCreate = () => {
    createLobby().then((res: LobbyProfile | null) => {
      console.log("Created lobby:", res);
      if (res) {
        navigate(`/lobbies/${res.id}`);
      }
    });
  };

  return (
    <div>
      <CreateLobbyMenu handleCreate={handleCreate} />

      <JoinLobbyMenu />
    </div>
  );
}

function CreateLobbyMenu({ handleCreate }: { handleCreate: () => void }) {
  return (
    <div>
      <h1>Create Lobby</h1>
      <button onClick={handleCreate}>Create Lobby</button>
    </div>
  );
}

// TODO: fix this entire component lol
function JoinLobbyMenu() {
  useAuth()
  const {joinLobby} = useLobbies();
  const handleSubmit = (event) => {
    // event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const lobbyCode = formData.get("lobbyId");
    joinLobby(String(lobbyCode!));
  };

  return (
    <Form.Root onSubmit={handleSubmit}>
      <Form.Field name="lobbyId">
        <Form.Label>Lobby Code</Form.Label>
        <Form.Control asChild>
          <input
            type="text"
            name="lobbyId"
            placeholder="Enter lobby code"
            required
          />
        </Form.Control>
      </Form.Field>

      <Form.Submit asChild>
        <button type="submit">Join Lobby</button>
      </Form.Submit>
    </Form.Root>
  );
}

export default Lobbies;
