import { useState } from "react";
import { createLobby, joinLobby } from "../../services/lobbies";
import type { LobbyPayload, LobbyConfig } from "shared";
import LobbyConfigForm from "./ConfigForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LobbySearch({
  setLobby,
}: {
  setLobby: (lobby: LobbyPayload | null) => void;
}) {
  const [code, setCode] = useState<string>("");
  const [showConfigForm, setShowConfigForm] = useState<boolean>(false);

  const handleCreateLobby = async (config: LobbyConfig) => {
    try {
      const lobby = await createLobby(config);
      setLobby(lobby);
      setShowConfigForm(false);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleJoinLobby = async () => {
    try {
      const lobby = await joinLobby(code);
      setLobby(lobby);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Lobby</CardTitle>
          <CardDescription>Start a new game lobby</CardDescription>
        </CardHeader>
        <CardContent>
          {showConfigForm ? (
            <LobbyConfigForm
              onSubmit={handleCreateLobby}
              onCancel={() => setShowConfigForm(false)}
            />
          ) : (
            <Button onClick={() => setShowConfigForm(true)}>Create Lobby</Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join Lobby</CardTitle>
          <CardDescription>Enter a lobby code to join</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Lobby Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter lobby code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <Button onClick={handleJoinLobby}>Join Lobby</Button>
        </CardContent>
      </Card>
    </div>
  );
}
