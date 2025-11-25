import { useState } from "react";
import supabase from "../supabase";

export default function LobbySearch() {
  const [code, setCode] = useState<string>("");
  return (
    <>
      <h2>Make lobby</h2>

      {/* This is such a thin wrapper, I might as well just use fetch lol */}
      <button
        onClick={() =>
          supabase.functions
            .invoke("api/lobbies", {
              method: "POST",
            })
            .then(({ data, error, response }) => {
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
            .then(({ data, error, response }) => {
              console.log(data);
              if (error) console.log(response?.json());
            });
        }}
      >
        join
      </button>
    </>
  );
}
