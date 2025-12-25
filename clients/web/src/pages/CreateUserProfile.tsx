import { useContext, useState, type FormEvent } from "react";
import { AuthContext } from "../contexts/Auth";
import { UserProfileContext } from "../contexts/UserProfile";
import { createProfile } from "../services/profiles";
import type { ProfileCreate } from "shared";

export default function CreateUserProfile() {
  // assume session is good
  const { session } = useContext(AuthContext);
  // man, this "direct to db" is so dumb. also serverless is dumb. i'm dumb. i hate this.
  // in all seriousness, this is so fragile, and should be controlled in the backend.
  // i dont want users to just change usernames again and again.
  const { update: invalidate } = useContext(UserProfileContext);
  const [newProfile, setNewProfile] = useState<ProfileCreate>({
    username: "",
    bio: "",
    id: session!.user.id,
  });

  async function submitTask(_e: FormEvent) {
    _e.preventDefault();
    try {
      await createProfile(newProfile);
      invalidate();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return (
    <>
      <h1>create profile</h1>
      <form onSubmit={submitTask}>
        <input
          type="text"
          placeholder="Username"
          value={newProfile.username}
          onChange={(e) =>
            setNewProfile((prev) => ({ ...prev, username: e.target.value }))
          }
        />
        <textarea
          placeholder="Task Description"
          value={newProfile.bio || ""}
          onChange={(e) =>
            setNewProfile((prev) => ({ ...prev, bio: e.target.value }))
          }
        ></textarea>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
