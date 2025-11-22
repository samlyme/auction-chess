import { useNavigate } from "react-router";
import supabase from "../supabase";
import { useState } from "react";
export default function Auth() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"signin"|"signup">("signin");

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function handleSubmit() {
    if (mode === "signin") {
      const {data, error} = await supabase.auth.signInWithPassword({email, password});
      console.log({data, error});
      if (error?.code === "email_not_confirmed") navigate("/auth/email-confirmation")
    }
    else {
      const {data, error} = await supabase.auth.signUp({email, password})
      console.log({data, error});
      navigate("/auth/email-confirmation")
    }
  }

  return (
    <>
      <h1>Auth</h1>
      <input type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}/>
      <button onClick={() => setMode((prev) => prev === "signin" ? "signup" : "signin")}>signin / signup</button>
      <button onClick={handleSubmit}>{mode}</button>
    </>
  );
}
