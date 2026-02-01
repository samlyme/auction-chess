import type { Color } from "shared/types/game";

export const opposite = (color: Color) => (color === "white" ? "black" : "white");
