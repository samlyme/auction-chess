import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/Auth";
import type { Tables } from "../supabase";
import supabase from "../supabase";
import { UserProfileContext } from "../contexts/UserProfile";

export default function Lobby() {
    const {session, user, loading: authLoading} = useContext(AuthContext);
    const {profile, loading: profileLoading} = useContext(UserProfileContext);

    const [userRole, setUserRole] = useState<"host" | "guest">("host");
    const [userLobby, setUserLobby] = useState<Tables<"lobbies"> | null>(null);
    const [oppProfile, setOppProfile] = useState<Tables<"profiles"> | null>(null);


    useEffect(() => {
        if (authLoading || profileLoading) return;
        if (!session || !user || !profile) return;

        console.log(session);

        supabase.functions.invoke<Tables<'lobbies'>>("api/lobbies", {
            method: "GET"
        })
        .then(({data, error, response}) => {
            if (error || !data) return console.log(response?.json());
            setUserLobby(data);
            setUserRole(data.host_uid === user.id ? "host" : "guest");

            if (data.guest_uid) {
                supabase.from("profiles").select("*").eq("id", data.guest_uid).single()
                .then((value) => {
                    if (!value) return;
                    if (value.error) return console.log(value.error);
                    console.log("lobby get opp", value.data);
                    setOppProfile(value.data);
                })
            }
        })

    }, [session])

    async function createLobby() {
        const res = await supabase.functions.invoke(
            'lobbies', 
            { 
                method: 'GET',
                // body: { lmao: 'lmao'},
            }
        )
        console.log(res);
        
    }

    return (
        <>
            <h1>lobby: {userLobby?.id}</h1>
            <h2>code: {userLobby?.code}</h2>
            <h2>host: {userRole == "host" ? profile?.username : oppProfile?.username}</h2>
            <h2>guest: {userRole == "guest" ? profile?.username : oppProfile?.username}</h2>
            <button onClick={createLobby}>make lobby</button>
        </>
    )
}