import { useState } from 'react';
import styles from './Home.module.css';

function Home({ navigateTo }) {
  const [hoveredButton, setHoveredButton] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const player = {
    username: user.username || "Player_01",
    elo: user.elo || 1200
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>♟ ChessHub</h1>
        </div>
        <div 
          className={styles.profileSection}
          onClick={() => navigateTo('profile')}
          role="button"
          tabIndex="0"
        >
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{player.username}</span>
            <span className={styles.profileElo}>{player.elo}</span>
          </div>
          <div className={styles.profileAvatar}>👤</div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.mainContent}>
          <h2 className={styles.welcomeText}>Choose Your Game Mode</h2>
          <div className={styles.buttonsGrid}>
            <button
              className={`${styles.actionButton} ${styles.rankedButton} ${hoveredButton === 'ranked' ? styles.active : ''}`}
              onClick={() => navigateTo('timeFormat')}
              onMouseEnter={() => setHoveredButton('ranked')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span className={styles.buttonIcon}>⚔️</span>
              <span className={styles.buttonText}>Play Ranked</span>
              <span className={styles.buttonDesc}>Compete in rated games</span>
            </button>

            <button
              className={`${styles.actionButton} ${styles.customButton} ${hoveredButton === 'custom' ? styles.active : ''}`}
              onClick={() => navigateTo('customRoom')}
              onMouseEnter={() => setHoveredButton('custom')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span className={styles.buttonIcon}>🎮</span>
              <span className={styles.buttonText}>Custom Room</span>
              <span className={styles.buttonDesc}>Play with friends</span>
            </button>

            <button
              className={`${styles.actionButton} ${styles.tutorialButton} ${hoveredButton === 'tutorial' ? styles.active : ''}`}
              onClick={() => navigateTo('tutorial')}
              onMouseEnter={() => setHoveredButton('tutorial')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span className={styles.buttonIcon}>🎓</span>
              <span className={styles.buttonText}>How to Play</span>
              <span className={styles.buttonDesc}>Learn how pieces move</span>
            </button>

            <button
              className={`${styles.actionButton} ${styles.analyzeButton} ${hoveredButton === 'analyze' ? styles.active : ''}`}
              disabled
              onMouseEnter={() => setHoveredButton('analyze')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span className={styles.buttonIcon}>📊</span>
              <span className={styles.buttonText}>Analyze</span>
              <span className={styles.buttonDesc}>Coming soon</span>
            </button>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p></p>
      </footer>
    </div>
  );
}

export default Home;
