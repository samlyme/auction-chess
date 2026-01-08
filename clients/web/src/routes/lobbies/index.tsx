import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/lobbies/')({
  beforeLoad: ({ search }) => {
    return search;
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full w-full justify-center overflow-auto bg-(--color-background) p-8">
      <h1 className="text-4xl">Lobby ABCDEF</h1>
    </div>
  );
}
