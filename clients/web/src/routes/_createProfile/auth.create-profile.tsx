import { createFileRoute } from "@tanstack/react-router";
import CreateUserProfile from "@/pages/CreateUserProfile";

export const Route = createFileRoute("/_createProfile/auth/create-profile")({
  component: CreateUserProfile,
});
