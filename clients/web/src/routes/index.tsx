import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  return (
    <div className="h-full w-full overflow-auto bg-(--color-background)">
      {/* Banner */}
      <div className="h-[40vh] w-full overflow-hidden">
        <img
          src="https://placehold.co/1200x400/2563eb/white?text=Auction+Chess"
          alt="Auction Chess Banner"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-8 text-center text-6xl font-bold">
          Welcome to Auction Chess!
        </h1>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </p>
        </div>

        <button
          onClick={() => navigate({ to: '/auth' })}
          className="rounded-lg bg-primary-500 px-6 py-3 text-base text-white transition-colors hover:bg-primary-600"
        >
          Play
        </button>
      </div>
    </div>
  );
}
