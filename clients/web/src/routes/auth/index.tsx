import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createFileRoute } from '@tanstack/react-router'
import supabase from "@/supabase";

export const Route = createFileRoute('/auth/')({
  component: Auth,
})

function Auth() {
  const [confirmEmail, setConfirmEmail] = useState<boolean>(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const origin = window.location.origin;

  async function handleSubmit() {
    if (mode === "signin") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log({ data, error });
      if (error?.code === "email_not_confirmed") setConfirmEmail(true);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: origin,
        },
      });
      console.log({ data, error });
      if (!error) setConfirmEmail(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Sign in to your account"
              : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {confirmEmail ? (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold">Confirmation Email Sent!</h2>
              <p className="text-muted-foreground mt-2">Check your inbox to verify your email</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmit} size="lg">
                {mode === "signin" ? "Sign In" : "Sign Up"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setMode((prev) => (prev === "signin" ? "signup" : "signin"))}
              >
                {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  // TODO: signInWithOAuth lets you encode the query param into redirectTo.
                  supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: origin,
                    },
                  });
                }}
              >
                Sign in with Google
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

