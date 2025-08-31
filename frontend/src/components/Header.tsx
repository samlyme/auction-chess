import { useNavigate } from "react-router";
import { useAuthContext } from "../contexts/Auth";

function Header() {
    const { logout } = useAuthContext();
    const navigate = useNavigate()
    return (
        <div className="frame">
            <button onClick={logout}>Logout</button>
            <button onClick={() => navigate("/")}>Home</button>
        </div>
    )
}

export default Header;