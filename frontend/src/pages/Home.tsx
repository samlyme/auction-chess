import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

function Home() {
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) navigate("/lobbies")
    } ,[])

    return (
        <div className="home">
            <h1>Welcome to Auction Chess</h1>
            <Link to="/auth">
                <h1>login/signup</h1>
            </Link>
        </div>
    )
}

export default Home;