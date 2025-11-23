import { Link } from "react-router";
import supabase from "../supabase";

export default function Home(){
    return <>
        <h1>Home</h1>

        <h2>
            <Link to={"/profile/me"} replace >
                User Profile
            </Link>
        </h2>

        <h2>Make lobby</h2>
        <button onClick={() => supabase.functions.invoke("api/lobbies", {
            method: "POST"
        }).then((val) => {
            console.log(val);
            
        })}>make lobby</button>

        <h2>Join Lobby</h2>
        <button onClick={() => supabase.auth.signOut()}>sign out</button>
    </>
}