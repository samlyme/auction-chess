import supabase from "@/supabase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button, FormInput, Card } from "@/components/ui";

export const Route = createFileRoute("/auth/")({
  beforeLoad: ({ context }) => {
    if (context.auth.session) throw redirect({ to: "/home" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = Route.useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      console.log({ data, error });
      if (!error) navigate({ to: "/home" });
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log({ data, error });
      if (!error) navigate({ to: "/home" });
    }
  };

  const handleAnonymousSignIn = async () => {
    navigate({ to: "/auth/guest-signin" });
  }

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error("Error signing in with Google:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-(--color-background)">
      <Card className="w-120">
        <h1 className="mb-6 text-center text-3xl font-bold">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h1>

        {/* Email/Password Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormInput
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <FormInput
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" variant="blue" fullWidth>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="mt-4 mb-4 flex-1 border-t"></div>
          {/* <span className="px-4 text-sm text-gray-500">or</span> */}
          {/* <div className="flex-1 border-t"></div> */}
        </div>

        {/* Anonymous Sign In */}
        <Button
          onClick={handleAnonymousSignIn}
          variant="outline"
          fullWidth
          className="mb-6"
        >
          Play as Guest.
        </Button>


        {/* Google Sign In */}
        <Button onClick={handleGoogleSignIn} variant="outline" fullWidth>
          Sign in with Google
        </Button>

        {/* Toggle Sign In/Sign Up */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary-500 font-medium hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </Card>
    </div>
  );
}
