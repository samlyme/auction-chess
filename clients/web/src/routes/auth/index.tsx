import supabase from "@/supabase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

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
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Error signing in Anonymously:", error);
      alert(`Error: ${error.message}`);
    }
    else {
      navigate({ to: "/home" })
    }
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
      <div className="w-full max-w-md rounded-lg border bg-neutral-800 p-8">
        <h1 className="mb-6 text-center text-3xl font-bold">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h1>

        {/* Email/Password Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-400 w-full rounded-lg px-4 py-2 text-white transition-colors"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t"></div>
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t"></div>
        </div>

        {/* Anonymous Sign In */}
        <button
          onClick={handleAnonymousSignIn}
          className="w-full mb-6 rounded-lg border px-4 py-2 transition-colors hover:bg-gray-50"
        >
          Play as Guest.
        </button>


        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full rounded-lg border px-4 py-2 transition-colors hover:bg-gray-50"
        >
          Sign in with Google
        </button>

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
      </div>
    </div>
  );
}
