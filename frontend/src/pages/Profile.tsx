import { useNavigate } from "react-router";
import { useEffect } from "react";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";

function Profile() {
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) navigate("/home")
    })
    return (
        <div className="profile">
            <Header />
            <h1>User profile</h1>
        </div>
    )
}

export default Profile;