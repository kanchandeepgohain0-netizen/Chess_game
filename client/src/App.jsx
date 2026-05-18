import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Profile from './pages/Profile';
import TimeFormat from './pages/TimeFormat';
import Matchmaking from './pages/Matchmaking';
import CustomRoom from './pages/CustomRoom';
import Game from './pages/Game';
import Login from './pages/Login';
import Register from './pages/Register';


export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [gameMode, setGameMode] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      setCurrentPage('home');
    }
  }, []);

  const navigateTo = (page, mode = null) => {
    if (page === 'login' || page === 'register') {
      setIsLoggedIn(false);
    }
    setCurrentPage(page);
    if (mode) setGameMode(mode);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login navigateTo={navigateTo} />;
      case 'register':
        return <Register navigateTo={navigateTo} />;
      case 'home':
        return <Home navigateTo={navigateTo} />;
      case 'profile':
        return <Profile navigateTo={navigateTo} />;
      case 'timeFormat':
        return <TimeFormat navigateTo={navigateTo} />;
      case 'matchmaking':
        return <Matchmaking navigateTo={navigateTo} gameMode={gameMode} />;
      case 'customRoom':
        return <CustomRoom navigateTo={navigateTo} />;
      case 'game':
        return <Game navigateTo={navigateTo} gameMode={gameMode} />;
      default:
        return isLoggedIn ? <Home navigateTo={navigateTo} /> : <Login navigateTo={navigateTo} />;
    }
  };

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {renderPage()}
    </div>
  );
}