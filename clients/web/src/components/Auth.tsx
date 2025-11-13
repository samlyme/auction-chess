import supabase from "../supabase";
import { useState } from "react";
export default function Auth() {
  const [mode, setMode] = useState<"signin"|"signup">("signin");

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function handleSubmit() {
    console.log('auth submit', {email, password});
    if (mode === "signin") {
      const res = await supabase.auth.signInWithPassword({email, password});
      console.log(res.data);
      
    }
    else {
      const res = await supabase.auth.signUp({email, password})
      console.log(res.data);
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
