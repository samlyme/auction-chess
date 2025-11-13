import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/Auth";
import type { Tables } from "../supabase";
import supabase from "../supabase";

export default function Lobby() {
    const session = useContext(AuthContext);
    const [userLobby, setUserLobby] = useState<Tables<"lobbies"> | null>(null)

    useEffect(() => {
        if (!session) return;
        console.log(session);
        

        supabase.from('lobbies').select("*")
            .eq('host_uid', session.user.id)
            .single()
            .then((val) => {
                console.log(val);
                setUserLobby(val.data)
            })
    }, [session])

    async function createLobby() {
        const res = await supabase.from('lobbies').insert({ code: "lmfaoo" })
        console.log("create lobby res", res);
    }

    return (
        <>
            <h1>lobby: {userLobby?.id}</h1>
            <h2>code: {userLobby?.code}</h2>
            <h2>host: {userLobby?.host_uid}</h2>
            <h2>guest: {userLobby?.guest_uid}</h2>
            <button onClick={createLobby}>make lobby</button>
        </>
    )
}