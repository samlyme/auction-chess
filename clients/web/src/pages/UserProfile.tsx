import { useContext, useState, type FormEvent } from "react";
import supabase, { type Tables } from "../supabase";
import { AuthContext } from "../contexts/Auth";
import { UserProfileContext } from "../contexts/UserProfile";

export default function UserProfile() {
  const {profile, invalidate} = useContext(UserProfileContext);

  return <>
  {profile && <>
    <h2>Username: {profile.username}</h2>
    <h2>Bio: {profile.bio}</h2>
  </>}
    <ProfileForm invalidate={invalidate!}/>
  </>
}

function ProfileForm({invalidate}: {invalidate: () => void}) {
  const {session} = useContext(AuthContext)
  const [newProfile, setNewProfile] = useState<Omit<Tables<'profiles'>, 'created_at' | 'id'>>({username: "", bio: ""});
  async function submitTask(_e: FormEvent) {
    _e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const res = await supabase.from('profiles').upsert(newProfile).eq('id', session?.user.id)
    invalidate();
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