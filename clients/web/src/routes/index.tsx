import { Link, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    // if the user is logged in, send them to the lobbies page
    if (context.auth.session) throw redirect({ to: "/home" });
  },
  component: Splash,
})

function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Auction Chess</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild size="lg">
            <Link to={"/auth"}>Get Started</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
