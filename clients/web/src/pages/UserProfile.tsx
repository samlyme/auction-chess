import { useContext, useState, type FormEvent } from "react";
import { UserProfileContext } from "../contexts/UserProfile";
import { updateProfile } from "../services/profiles";
import type { ProfileUpdate } from "shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";

export default function UserProfile() {
  const { profile, update: invalidate } = useContext(UserProfileContext);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button variant="outline" asChild>
            <Link to="/lobby">Back to Lobbies</Link>
          </Button>
        </div>
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle>{profile.username}</CardTitle>
              <CardDescription>{profile.bio || "No bio set"}</CardDescription>
            </CardHeader>
          </Card>
        )}
        <ProfileForm invalidate={invalidate!} />
      </div>
    </div>
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
    <Card>
      <CardHeader>
        <CardTitle>Update Bio</CardTitle>
        <CardDescription>Change your profile bio</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitTask} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bio">New Bio</Label>
            <Textarea
              id="bio"
              placeholder="Enter your new bio"
              value={newProfile.bio || ""}
              onChange={(e) =>
                setNewProfile((prev) => ({ ...prev, bio: e.target.value }))
              }
            />
          </div>
          <Button type="submit">Update Profile</Button>
        </form>
      </CardContent>
    </Card>
  );
}
