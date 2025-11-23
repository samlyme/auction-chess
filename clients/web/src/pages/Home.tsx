import { Link } from "react-router";
import supabase from "../supabase";
import { useState } from "react";

export default function Home(){
    const [code, setCode] = useState<string>("")
    return <>
        <h1>Home</h1>

        <h2>
            <Link to={"/profile/me"} replace >
                User Profile
            </Link>
        </h2>

        <h2>Make lobby</h2>
        
        {/* This is such a thin wrapper, I might as well just use fetch lol */}
        <button onClick={() => supabase.functions.invoke("api/lobbies", {
            method: "POST"
        }).then((val) => {
            console.log(val);
            
        })}>make lobby</button>

        <h2>Join Lobby</h2>
        <input type="text" value={code} onChange={(e) => {
            setCode(e.target.value);
        }}></input>
        <button onClick={() => {
            supabase.functions.invoke(`api/lobbies/${code}/join`, {
                method: "POST",
            })
            .then(val => {
                console.log(val);
            })
        }}>join</button>


        <button onClick={() => supabase.auth.signOut()}>sign out</button>
    </>
}