import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import supabase from "@/supabase";
import {
  useCreateProfileMutationOptions,
  useMyProfileOptions,
} from "@/queries/profiles";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/auth/create-profile")({
  // TODO: redirect user off this page if profile is created.
  beforeLoad: async ({ context }) => {
    const { queryClient } = context;
    const profile = await queryClient.ensureQueryData(useMyProfileOptions());
    if (profile) throw redirect({ to: "/home" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const createProfileMutation = useMutation(useCreateProfileMutationOptions());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await createProfileMutation.mutateAsync({
        id: user.id,
        username,
      });

      console.log("trying to navigate");

      navigate({ to: "/home" });
    } catch {
      // Error is handled by the mutation state
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto bg-(--color-background) p-8">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-neutral-800 p-8 shadow-lg">
        <h1 className="mb-6 text-4xl">Pick a username</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="mb-2 block text-base">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-300 bg-neutral-400 px-4 py-3 text-base"
            />
          </div>
          {createProfileMutation.error && (
            <div className="mb-4 text-base text-red-600">
              {createProfileMutation.error.detail.data.message}
            </div>
          )}
          <button
            type="submit"
            disabled={createProfileMutation.isPending}
            className="rounded-lg bg-blue-600 px-6 py-3 text-base text-white transition-colors hover:bg-blue-400 disabled:bg-neutral-400"
          >
            {createProfileMutation.isPending ? "Creating..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
