import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";

function Header() {
    const { logout } = useAuth();
    const navigate = useNavigate()
    return (
        <div className="frame">
            <button onClick={logout}>Logout</button>
            <button onClick={() => navigate("/")}>Home</button>
        </div>
    )
}

export default Header;