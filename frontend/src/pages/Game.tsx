import { useNavigate } from "react-router";
import Board from "../components/Board";
import { useAuthContext } from "../contexts/Auth";
import { useEffect } from "react";
import Header from "../components/Header";

function Game() {
    const { token } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) navigate("/home")
    })
    return (
        <div className="game">
            <Header />
            <h1>game</h1>
            <Board />
        </div>
    )
}

export default Game;