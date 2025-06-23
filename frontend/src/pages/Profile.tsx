import { useNavigate } from "react-router";
import { useAuthContext } from "../contexts/Auth";
import { useEffect } from "react";
import Header from "../components/Header";

function Profile() {
    const { token } = useAuthContext();
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