import type { LobbyPayload, Profile } from "shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LobbyInfo({
  lobby,
  hostProfile,
  guestProfile,
  userRole,
}: {
  lobby: LobbyPayload;
  hostProfile: Profile | null;
  guestProfile: Profile | null;
  userRole: "host" | "guest";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lobby: {lobby.code}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Host:</span>
          <span>{hostProfile?.username || "..."}</span>
          {userRole === "host" && <span className="text-muted-foreground">(you)</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Guest:</span>
          <span>{guestProfile?.username || "Waiting..."}</span>
          {userRole === "guest" && <span className="text-muted-foreground">(you)</span>}
        </div>
      </CardContent>
    </Card>
  );
}
