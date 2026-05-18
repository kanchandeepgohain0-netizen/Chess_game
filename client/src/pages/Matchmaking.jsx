import { useState, useEffect } from 'react';
import styles from './Matchmaking.module.css';

function Matchmaking({ navigateTo, gameMode }) {
  const [searching, setSearching] = useState(true);
  const [matchFound, setMatchFound] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  const currentPlayer = {
    username: "Player_01",
    elo: 1200,
    avatar: "👤"
  };

  const opponent = {
    username: "ChessMaster_42",
    elo: 1195,
    avatar: "🎯"
  };

  useEffect(() => {
    if (!searching) return;

    const searchInterval = setInterval(() => {
      setSearchTime(prev => {
        const newTime = prev + 1;
        if (newTime >= 3) {
          setSearching(false);
          setMatchFound(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(searchInterval);
  }, [searching]);

  const handlePlayMatch = () => {
    navigateTo('game');
  };

  const handleCancel = () => {
    navigateTo('home');
  };

  const formatDisplay = gameMode ? gameMode.charAt(0).toUpperCase() + gameMode.slice(1) : 'Rapid';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button 
          className={styles.cancelButton}
          onClick={handleCancel}
        >
          ✕
        </button>
        <h2 className={styles.title}>
          {searching ? 'Finding Opponent...' : 'Match Found!'}
        </h2>
        <div className={styles.formatBadge}>{formatDisplay}</div>
      </header>

      <main className={styles.main}>
        <div className={styles.matchmakingContent}>
          {/* Left Side - Current Player */}
          <div className={styles.playerSection}>
            <div className={`${styles.playerCard} ${!matchFound ? styles.searching : styles.ready}`}>
              <div className={styles.playerAvatar}>{currentPlayer.avatar}</div>
              <div className={styles.playerDetails}>
                <h3 className={styles.playerName}>You</h3>
                <p className={styles.playerElo}>ELO: {currentPlayer.elo}</p>
              </div>
            </div>
            {searching && (
              <div className={styles.searchSpinner}>
                <div className={styles.spinnerDot}></div>
                <p className={styles.searchText}>{searchTime}s searching...</p>
              </div>
            )}
          </div>

          {/* VS Badge */}
          <div className={styles.vsBadge}>
            {matchFound ? '✓' : '⚔'}
          </div>

          {/* Right Side - Opponent */}
          <div className={styles.playerSection}>
            {matchFound ? (
              <div className={`${styles.playerCard} ${styles.found}`}>
                <div className={styles.playerAvatar}>{opponent.avatar}</div>
                <div className={styles.playerDetails}>
                  <h3 className={styles.playerName}>{opponent.username}</h3>
                  <p className={styles.playerElo}>ELO: {opponent.elo}</p>
                </div>
              </div>
            ) : (
              <div className={`${styles.playerCard} ${styles.searching}`}>
                <div className={`${styles.playerAvatar} ${styles.placeholder}`}>?</div>
                <div className={styles.playerDetails}>
                  <h3 className={styles.playerName}>Searching...</h3>
                  <p className={styles.playerElo}>Waiting for match</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {matchFound && (
          <div className={styles.actionButtons}>
            <button 
              className={styles.playButton}
              onClick={handlePlayMatch}
            >
              Start Game
            </button>
            <button 
              className={styles.declineButton}
              onClick={() => {
                setMatchFound(false);
                setSearching(true);
                setSearchTime(0);
              }}
            >
              Find Another
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Matchmaking;
