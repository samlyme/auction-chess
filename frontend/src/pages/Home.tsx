import { Navigate } from 'react-router';
import useAuth from '../hooks/useAuth';

function Home() {
  const { token } = useAuth();

  if (token) {
    return (
      <Navigate to="/lobbies" />
    )
  }

  return (
    <div className="home">
      <h1>Welcome to Auction Chess</h1>
      <h4>A novel chess variant with pricing, bluffing, and illegal moves.</h4>
      <button>Play now!</button>
      <button>Learn more.</button>

      <h2>What is auction chess?</h2>

      <p>
        Auction chess is a novel chess variant that incorporates a pricing and 
        resource management system into traditional chess. Strategic pricing 
        and management are required to win!
      </p>

      <button>Rules</button>
    </div>
  );
}

export default Home;
