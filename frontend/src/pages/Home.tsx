import { Link, useNavigate } from "react-router";
import { useAuthContext } from "../contexts/Auth";
import { useEffect } from "react";
import Header from "../components/Header";

function Home() {
    const { token } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) navigate("/game")
    } ,[])

    return (
        <div className="home">
            <Header />
            <h1>Welcom to Auction Chess</h1>
            <Link to="/auth">
                <h1>login/signup</h1>
            </Link>
        </div>
    )
}

export default Home;