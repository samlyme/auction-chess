import type { LobbyPayload, Profile } from "shared";

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
    <>
      <h2>code: {lobby.code}</h2>
      <h2>
        host: {hostProfile?.username} {userRole === "host" && <em>(you)</em>}
      </h2>
      <h2>
        guest: {guestProfile?.username} {userRole === "guest" && <em>(you)</em>}
      </h2>
    </>
  );
}
