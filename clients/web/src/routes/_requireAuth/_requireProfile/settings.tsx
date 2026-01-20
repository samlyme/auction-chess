import supabase from "@/supabase";
import { createFileRoute } from "@tanstack/react-router";
import { Button, FormInput, Card } from "@/components/ui";

export const Route = createFileRoute("/_requireAuth/_requireProfile/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const profile = Route.useRouteContext().profile;

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(`Error signing out: ${error.message}`);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-(--color-background)">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-8 text-4xl font-bold">Settings</h1>

        <Card className="shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold">Profile</h2>

          <form
            onSubmit={() => {
              console.log("Profile updates not supported");
            }}
            className="flex flex-col gap-6"
          >
            <FormInput
              id="username"
              label="Username"
              type="text"
              value={profile.username}
              disabled
              className="cursor-not-allowed border-neutral-300 bg-neutral-600 px-4 py-2 text-neutral-400"
            />

            <Button
              type="submit"
              variant="blue"
              size="lg"
              fullWidth
              disabled={true}
            >
              "Update Profile"
            </Button>
          </form>
        </Card>

        <Card className="mt-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-semibold">Account</h2>
          <Button
            onClick={handleSignOut}
            variant="red"
            size="lg"
            fullWidth
          >
            Sign Out
          </Button>
        </Card>
      </div>
    </div>
  );
}
