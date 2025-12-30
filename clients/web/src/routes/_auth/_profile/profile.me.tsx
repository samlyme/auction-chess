import { createFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute('/_auth/_profile/profile/me')({
  component: UserProfile
})

function UserProfile() {
  const { profile } = Route.useRouteContext();
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
        {/* <ProfileForm invalidate={invalidate!} /> */}
      </div>
    </div>
  );
}
