import React from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate(); // Correct naming for clarity

  return (
    <div>
      <Header />
      <button
        className="m-5 px-4 py-2 rounded bg-red-500 text-white"
        onClick={() => navigate('/meeting')}
      >
        Select Meeting
      </button>
    </div>
  );
}

export default HomePage;
