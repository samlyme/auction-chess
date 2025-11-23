import supabase from "../supabase";
import { useState } from "react";

export default function Auth() {
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
    <>
      <h1>Auth</h1>
      {confirmEmail ? (
        <h1>Confirmation Email sent!</h1>
      ) : (
        <>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={() =>
              setMode((prev) => (prev === "signin" ? "signup" : "signin"))
            }
          >
            signin / signup
          </button>
          <button onClick={handleSubmit}>{mode}</button>

          <button
            onClick={() => {
              supabase.auth.signInWithOAuth({
                provider: "google",
              });
            }}
          >
            Sign in with Google
          </button>
        </>
      )}
    </>
  );
}
