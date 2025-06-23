import { useAuthContext } from "../contexts/Auth";

function Header() {
    const { logout } = useAuthContext();
    return (
        <div className="frame">
            <button onClick={logout}>Logout</button>
        </div>
    )
}

export default Header;