import { Link } from "react-router";
import supabase, { type Tables } from "../supabase";
import { useState } from "react";
import useLobby from "../hooks/useLobby";
import Lobby from "../components/Lobby";

export default function Lobbies() {
  const [code, setCode] = useState<string>("");
  const lobby = useLobby();

  return (
    <>
      <h1>Lobbies</h1>

      <h2>
        <Link to={"/profile/me"} replace>
          User Profile
        </Link>
      </h2>

      {lobby ? (
        <>
          <Lobby />
        </>
      ) : (
        <>
          <h2>Make lobby</h2>

          {/* This is such a thin wrapper, I might as well just use fetch lol */}
          <button
            onClick={() =>
              supabase.functions
                .invoke("api/lobbies", {
                  method: "POST",
                })
                .then(({data, error, response}) => {
                  console.log(data);
                  if (error) console.log(response?.json());
                })
            }
          >
            make lobby
          </button>

          <h2>Join Lobby</h2>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
            }}
          ></input>
          <button
            onClick={() => {
              supabase.functions
                .invoke(`api/lobbies/${code}/join`, {
                  method: "POST",
                })
                .then(({data, error, response}) => {
                  console.log(data);
                  if (error) console.log(response?.json());
                });
            }}
          >
            join
          </button>
        </>
      )}

      <button onClick={() => supabase.auth.signOut()}>sign out</button>

      <h1>REMOVE LATER! THIS IS FOR DEV</h1>

      <h2>Make lobby</h2>

      {/* This is such a thin wrapper, I might as well just use fetch lol */}
      <button
        onClick={async () => {
            const {data, error, response} = await supabase.functions
              .invoke<Tables<'lobbies'>>("api/lobbies", {
                method: "POST",
              })
            console.log(data);
            if (error) console.log(response?.json());
            
            
        }}
      >
        make lobby
      </button>

      <h2>Join Lobby</h2>
      <input
        type="text"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
        }}
      ></input>
      <button
        onClick={() => {
          supabase.functions
            .invoke(`api/lobbies/${code}/join`, {
              method: "POST",
            })
            .then((res) => {
              console.log("res", res);
            });
        }}
      >
        join
      </button>
    </>
  );
}
