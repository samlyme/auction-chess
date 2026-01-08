import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/auth/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = Route.useNavigate();

  return (
    <div className="flex h-full w-full items-center justify-center bg-(--color-background)">
      <div className="w-full max-w-md rounded-lg border border-gray-300 p-8">
        <h1 className="mb-6 text-center text-3xl font-bold">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h1>

        {/* Email/Password Form */}
        <form className="space-y-4" onSubmit={() => navigate({ to: '/home' })}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Sign In */}
        <button className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50">
          Sign in with Google
        </button>

        {/* Toggle Sign In/Sign Up */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-primary-500 hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
