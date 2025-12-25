import { useContext, useState, type FormEvent } from "react";
import { UserProfileContext } from "../contexts/UserProfile";
import { updateProfile } from "../services/profiles";
import type { ProfileUpdate } from "shared";

export default function UserProfile() {
  const { profile, update: invalidate } = useContext(UserProfileContext);

  return (
    <>
      {profile && (
        <>
          <h2>Username: {profile.username}</h2>
          <h2>Bio: {profile.bio}</h2>
        </>
      )}
      <ProfileForm invalidate={invalidate!} />
    </>
  );
}

function ProfileForm({ invalidate }: { invalidate: () => void }) {
  const [newProfile, setNewProfile] = useState<ProfileUpdate>({ bio: "" });
  async function submitTask(_e: FormEvent) {
    _e.preventDefault();
    try {
      await updateProfile(newProfile);
      invalidate();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return (
    <form onSubmit={submitTask}>
      <textarea
        placeholder="Task Description"
        value={newProfile.bio || ""}
        onChange={(e) =>
          setNewProfile((prev) => ({ ...prev, bio: e.target.value }))
        }
      ></textarea>
      <button type="submit">Submit</button>
    </form>
  );
}
