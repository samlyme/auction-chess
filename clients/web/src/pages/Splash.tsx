import { Link } from "react-router";

export default function Splash() {
    return <>
        <h1>Splash</h1>
        <Link to={"/auth"}>auth page</Link>
    </>
}