import { createFileRoute } from "@tanstack/react-router";
import Splash from "@/pages/Splash";

export const Route = createFileRoute("/_unauthed/")({
  component: Splash,
});
