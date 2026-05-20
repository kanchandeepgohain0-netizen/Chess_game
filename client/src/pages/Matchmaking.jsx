import { useState, useEffect } from 'react';
import styles from './Matchmaking.module.css';
import socket from '../services/socket';

function Matchmaking({ navigateTo, gameMode }) {
  const [searching, setSearching] = useState(true);
  const [matchFound, setMatchFound] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [opponentInfo, setOpponentInfo] = useState(null); 
  const [isBotMatch, setIsBotMatch] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentPlayer = {
    username: user.username || 'You',
    elo: user.elo || 1200,
    avatar: '👤'
  };

  const [connectionStatus, setConnectionStatus] = useState(socket.connected ? 'connected' : 'connecting');

  useEffect(() => {
    const emitFindMatch = () => {
      if (user.userId) {
        socket.emit('register_user', { userId: user.userId });
      }
      socket.emit('find_match', {
        userId: user.userId,
        elo: user.elo || 1200,
        format: gameMode || 'rapid'
      });
    };

    const handleConnect = () => {
      setConnectionStatus('connected');
      emitFindMatch();
    };

    const handleConnectError = (err) => {
      console.error('Matchmaking connection error:', err);
      setConnectionStatus('error');
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    const timerInterval = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    socket.on('match_found', ({ gameId, color, opponent, format }) => {
      clearInterval(timerInterval);
      setSearching(false);
      setMatchFound(true);

      const isBot = !!opponent.isBot;
      setIsBotMatch(isBot);

      if (isBot) {
        setOpponentInfo({
          username: opponent.username || `AI Bot`,
          elo: opponent.elo || '~ELO',
          avatar: '🤖'
        });
        localStorage.setItem('isBotGame', 'true');
      } else {
        setOpponentInfo({ username: opponent.username || opponent.id, elo: '?', avatar: '🧑' });
        localStorage.setItem('isBotGame', 'false');
      }

      localStorage.setItem('gameId', gameId);
      localStorage.setItem('myColor', color);
    });

    socket.on('error_event', ({ message }) => {
      console.error('Matchmaking error:', message);
    });

    return () => {
      clearInterval(timerInterval);
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('disconnect', handleDisconnect);
      socket.off('match_found');
      socket.off('error_event');
    };
  }, []); 
  const handlePlayMatch = () => navigateTo('game', gameMode);

  const handleCancel = () => {
    socket.emit('cancel_match', { userId: user.userId });
    navigateTo('home');
  };

  const formatDisplay = gameMode
    ? gameMode.charAt(0).toUpperCase() + gameMode.slice(1)
    : 'Rapid';

  const botFallbackIn = Math.max(0, 30 - searchTime);
  

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.cancelButton} onClick={handleCancel}>✕</button>
        <h2 className={styles.title}>
          {connectionStatus === 'error'
            ? 'Connection Error!'
            : connectionStatus === 'connecting'
              ? 'Connecting to Server...'
              : searching
                ? 'Finding Opponent...'
                : isBotMatch
                  ? 'No Opponent Found — Matched with Bot!'
                  : 'Match Found!'}
        </h2>
        <div className={styles.formatBadge}>{formatDisplay}</div>
      </header>

      {connectionStatus === 'error' && (
        <div className={styles.connectionAlert} style={{
          backgroundColor: '#ff4d4d',
          color: '#ffffff',
          padding: '10px 15px',
          borderRadius: '8px',
          textAlign: 'center',
          margin: '15px auto',
          maxWidth: '450px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          lineHeight: '1.4',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
        }}>
          ⚠️ Socket server connection failed. Please verify your VITE_SERVER_URL and CLIENT_URL configurations.
        </div>
      )}

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
                {searchTime >= 10 && (
                  <p className={styles.searchText} style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                    Bot fallback in {botFallbackIn}s
                  </p>
                )}
              </div>
            )}
          </div>

          {/* VS Badge */}
          <div className={styles.vsBadge}>
            {matchFound ? (isBotMatch ? '🤖' : '✓') : '⚔'}
          </div>

          {/* Right Side - Opponent */}
          <div className={styles.playerSection}>
            {matchFound ? (
              <div className={`${styles.playerCard} ${styles.found}`}>
                <div className={styles.playerAvatar}>{opponentInfo?.avatar}</div>
                <div className={styles.playerDetails}>
                  <h3 className={styles.playerName}>{opponentInfo?.username}</h3>
                  <p className={styles.playerElo}>ELO: {opponentInfo?.elo}</p>
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
            <button className={styles.playButton} onClick={handlePlayMatch}>
              {isBotMatch ? 'Play vs Bot' : 'Start Game'}
            </button>
            {!isBotMatch && (
              <button
                className={styles.declineButton}
                onClick={() => {
                  setMatchFound(false);
                  setSearching(true);
                  setSearchTime(0);
                  setOpponentInfo(null);
                  socket.emit('find_match', {
                    userId: user.userId,
                    elo: user.elo || 1200,
                    format: gameMode || 'rapid'
                  });
                }}
              >
                Find Another
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Matchmaking;
