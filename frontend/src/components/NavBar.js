import React from 'react';
import { useNavigate } from 'react-router-dom';
import signOut from '../utils/Singout';


const NavBar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut(); // サインアウトの処理
    navigate('/'); // ログインページにリダイレクト
  };

  return (
    <nav style={{ padding: '10px', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <h2>Notification App</h2>
      </div>
        <button onClick={handleSignOut} style={{ padding: '5px 10px', cursor: 'pointer' }}>
          Sign Out
        </button>
    </nav>
  );
};

export default NavBar;
