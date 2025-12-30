import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import Lobbies from "@/pages/Lobbies";

const lobbiesSearchSchema = z.object({
  code: z.string().optional(),
});

export const Route = createFileRoute("/_complete/lobbies")({
  validateSearch: lobbiesSearchSchema,
  component: Lobbies,
});
