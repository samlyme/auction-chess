import { useNavigate } from "react-router";
import Board from "../components/Board";
import { useEffect } from "react";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";

function Game() {
    const { token } = useAuth();
    const navigate = useNavigate();

    // TODO: Refactor this with "auth gaurd" component
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