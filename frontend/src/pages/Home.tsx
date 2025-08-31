import { Link, useNavigate } from "react-router";
import { useAuthContext } from "../contexts/Auth";
import { useEffect } from "react";

function Home() {
    const { token } = useAuthContext();
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