import { Navigate, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";

function Home() {
    const { token } = useAuth();

    const navigate = useNavigate();

    if (token) {
        return <Navigate to={"/lobby"}></Navigate>
    }

    return (
        <div className="home">
            <h1>Welcome to Auction Chess!</h1>
            

            <h6>
            A unique chess variant with pricing, bluffing, and illegal moves.
            </h6>

            <button className="green" onClick={() => navigate("/about")}>Learn more</button>
            <button className="red" onClick={() => navigate("/auth")}>Play now</button>
        </div>
    )
}

export default Home;