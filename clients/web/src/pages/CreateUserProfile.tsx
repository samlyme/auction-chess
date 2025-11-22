import { useContext, useState, type FormEvent } from "react";
import type { Tables } from "../supabase";
import supabase from "../supabase";
import { AuthContext } from "../contexts/Auth";

export default function CreateUserProfile() {
  // assume session is good
  const {session} = useContext(AuthContext)
  const [newProfile, setNewProfile] = useState<Omit<Tables<'profiles'>, 'created_at'>>({username: "", bio: "", id: session!.user.id});

  async function submitTask(_e: FormEvent) {
    _e.preventDefault();
    await supabase.from('profiles').insert(newProfile)
  }

  return (
    <form onSubmit={submitTask}>
      <input type="text" placeholder='Username' value={newProfile.username} onChange={e => setNewProfile(
        prev => ({...prev, username: e.target.value})
      )} />
      <textarea placeholder='Task Description' value={newProfile.bio || ""} onChange={e => setNewProfile(
        prev => ({ ...prev, bio: e.target.value})
      )}></textarea>
      <button type="submit">Submit</button>
    </form>
  )
}