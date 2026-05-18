import styles from './Profile.module.css';

function Profile({ navigateTo }) {
  const player = {
    username: "Player_01",
    uid: "A1B2C3D4E5F6",
    elo: 1200,
    wins: 0,
    losses: 0,
    draws: 0
  };

  const totalGames = player.wins + player.losses + player.draws;
  const winRate = totalGames > 0 ? ((player.wins / totalGames) * 100).toFixed(1) : 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>Player Profile</h2>
        <button 
          className={styles.backButton}
          onClick={() => navigateTo('home')}
        >
          ← Back
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.profileCard}>
          {/* Avatar Section */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarCircle}>👤</div>
            <h3 className={styles.username}>{player.username}</h3>
            <p className={styles.uid}>ID: {player.uid}</p>
          </div>

          {/* Main Stats */}
          <div className={styles.statsGrid}>
            <div className={`${styles.statBox} ${styles.primary}`}>
              <span className={styles.statLabel}>ELO Rating</span>
              <span className={styles.statValue}>{player.elo}</span>
            </div>
            <div className={`${styles.statBox} ${styles.secondary}`}>
              <span className={styles.statLabel}>Win Rate</span>
              <span className={styles.statValue}>{winRate}%</span>
            </div>
            <div className={`${styles.statBox} ${styles.tertiary}`}>
              <span className={styles.statLabel}>Total Games</span>
              <span className={styles.statValue}>{totalGames}</span>
            </div>
          </div>

          {/* Match History */}
          <div className={styles.matchHistory}>
            <h4 className={styles.historyTitle}>Match History</h4>
            <div className={styles.historyStats}>
              <div className={`${styles.historyItem} ${styles.wins}`}>
                <span className={styles.historyCount}>{player.wins}</span>
                <span className={styles.historyLabel}>Wins</span>
              </div>
              <div className={`${styles.historyItem} ${styles.losses}`}>
                <span className={styles.historyCount}>{player.losses}</span>
                <span className={styles.historyLabel}>Losses</span>
              </div>
              <div className={`${styles.historyItem} ${styles.draws}`}>
                <span className={styles.historyCount}>{player.draws}</span>
                <span className={styles.historyLabel}>Draws</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
