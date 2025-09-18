import { useContext } from "react";
import { ServerUpdatesContext, type ServerUpdatesContextType } from "../contexts/ServerUpdates";


export default function useServerUpdates(): ServerUpdatesContextType {
    const out = useContext(ServerUpdatesContext);
    if (!out) throw Error("useServerUpdatesContext must be used within an erverUpdatesProvider")
    return out;
}