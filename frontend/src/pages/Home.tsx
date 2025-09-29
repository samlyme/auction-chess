import { Link, useNavigate } from 'react-router';
import { useEffect } from 'react';
import useAuth from '../hooks/useAuth';

function Home() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/lobbies');
  }, [navigate, token]);

  return (
    <div className="home">
      <h1>Welcome to Auction Chess</h1>
      <h2>A novel chess variant with pricing, bluffing, and illegal moves.</h2>
      <Link to="/auth">
        <h1>login/signup</h1>
      </Link>
    </div>
  );
}

export default Home;
