import { useContext, useState, type FormEvent } from "react";
import { AuthContext } from "../contexts/Auth";
import { UserProfileContext } from "../contexts/UserProfile";
import { createProfile } from "../services/profiles";
import type { ProfileCreate } from "shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function CreateUserProfile() {
  const { session } = useContext(AuthContext);
  const { update: invalidate } = useContext(UserProfileContext);
  const [newProfile, setNewProfile] = useState<ProfileCreate>({
    username: "",
    bio: "",
    id: session!.user.id,
  });


  async function submitProfile(_e: FormEvent) {
    _e.preventDefault();
    try {
      await createProfile(newProfile);
      invalidate();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Profile</CardTitle>
          <CardDescription>Set up your player profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={newProfile.username}
                onChange={(e) =>
                  setNewProfile((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                value={newProfile.bio || ""}
                onChange={(e) =>
                  setNewProfile((prev) => ({ ...prev, bio: e.target.value }))
                }
              />
            </div>
            <Button type="submit" size="lg">Create Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
