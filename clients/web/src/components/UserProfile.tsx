import { useContext, useEffect, useState, type FormEvent } from "react";
import supabase, { type Tables } from "../supabase";
import { AuthContext } from "../contexts/Auth";

export default function UserProfile() {
  const session = useContext(AuthContext);

  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);

  useEffect(() => {
    if (!session) return;

    supabase.from('profiles').select().eq('id', session.user.id).single()
    .then((res) => {
      setProfile(res.data)
    })
  }, [session])

  return (
    <>
      { profile
      ? <>
        <h1>Username: {profile.username}</h1>
        <h2>Description: {profile.bio}</h2>
        <ProfileForm />
      </>
      : <> 
        <ProfileForm />
      </>}
    </>
  );
}

function ProfileForm() {
  const session = useContext(AuthContext)
  const [newProfile, setNewProfile] = useState<Omit<Tables<'profiles'>, 'created_at' | 'id'>>({username: "", bio: ""});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function submitTask(_e: FormEvent) {
    const res = await supabase.from('profiles').upsert(newProfile).eq('id', session?.user.id)
    console.log(res);
    
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