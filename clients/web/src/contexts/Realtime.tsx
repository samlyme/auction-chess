import { createContext } from "react";

export const RealtimeContext = createContext<{enabled: boolean}>({ enabled: false });
