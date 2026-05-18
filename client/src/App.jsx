import { useState } from 'react';
import Home from './pages/Home';
import Profile from './pages/Profile';
import TimeFormat from './pages/TimeFormat';
import Matchmaking from './pages/Matchmaking';
import CustomRoom from './pages/CustomRoom';
import Game from './pages/Game';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [gameMode, setGameMode] = useState(null);

  const navigateTo = (page, mode = null) => {
    setCurrentPage(page);
    if (mode) setGameMode(mode);
  };

  const renderPage = () => {
    switch (currentPage) {
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
        return <Game navigateTo={navigateTo} />;
      default:
        return <Home navigateTo={navigateTo} />;
    }
  };

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {renderPage()}
    </div>
  );
}