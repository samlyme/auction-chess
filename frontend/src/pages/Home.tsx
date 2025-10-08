import { Navigate, useNavigate } from 'react-router';
import useAuth from '../hooks/useAuth';

function Home() {
  const { token } = useAuth();

  const navigate = useNavigate();

  if (token) {
    return <Navigate to="/lobbies" />;
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-7 p-7">
      <h1 className="text-center text-7xl">Welcome to Auction Chess</h1>
      <h4 className="text-center text-4xl">
        A novel chess variant with pricing, bluffing, and illegal moves.
      </h4>

      <div className="flex items-center space-x-2">
        <button
          className="rounded bg-green-500 px-4 py-2 text-white"
          onClick={() => navigate('/auth')}
        >
          Play now!
        </button>
      </div>

      <h2 className="text-center text-3xl">What is auction chess?</h2>

      <p className="max-w-prose text-center text-lg">
        Auction chess is a novel chess variant that incorporates a pricing and
        resource management system into traditional chess. Strategic pricing and
        management are required to win!
      </p>
    </div>
  );
}

export default Home;
