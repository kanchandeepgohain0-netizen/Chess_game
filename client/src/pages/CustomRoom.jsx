import { useState } from 'react';
import styles from './CustomRoom.module.css';

function CustomRoom({ navigateTo }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

  // Create Room Form
  const [createFormat, setCreateFormat] = useState('classical');
  const [createPassword, setCreatePassword] = useState('');

  // Join Room Form
  const [roomCode, setRoomCode] = useState('');
  const [joinPassword, setJoinPassword] = useState('');

  const handleCreateRoom = (e) => {
    e.preventDefault();
    console.log('[v0] Room created:', { createFormat, createPassword });
    setShowCreateModal(false);
    setCreatePassword('');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    console.log('[v0] Joining room:', { roomCode, joinPassword });
    setShowJoinModal(false);
    setRoomCode('');
    setJoinPassword('');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>Custom Room Lobby</h2>
        <button 
          className={styles.backButton}
          onClick={() => navigateTo('home')}
        >
          ← Back
        </button>
      </header>

      <main className={styles.main}>
        <p className={styles.lobbySubtitle}>Create a room or join a friend's room</p>

        <div className={styles.roomButtons}>
          <button
            className={`${styles.roomButton} ${styles.createButton} ${hoveredButton === 'create' ? styles.hovered : ''}`}
            onClick={() => setShowCreateModal(true)}
            onMouseEnter={() => setHoveredButton('create')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className={styles.buttonIcon}>➕</span>
            <span className={styles.buttonLabel}>Create Room</span>
          </button>

          <button
            className={`${styles.roomButton} ${styles.joinButton} ${hoveredButton === 'join' ? styles.hovered : ''}`}
            onClick={() => setShowJoinModal(true)}
            onMouseEnter={() => setHoveredButton('join')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className={styles.buttonIcon}>🔗</span>
            <span className={styles.buttonLabel}>Join Room</span>
          </button>
        </div>
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Create Custom Room</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Time Format</label>
                <div className={styles.formatOptions}>
                  {['classical', 'rapid', 'blitz'].map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      className={`${styles.formatOption} ${createFormat === fmt ? styles.active : ''}`}
                      onClick={() => setCreateFormat(fmt)}
                    >
                      {fmt.charAt(0).toUpperCase() + fmt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="create-password">Room Password (Optional)</label>
                <input
                  id="create-password"
                  type="password"
                  placeholder="Enter password to protect room"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.modalButtons}>
                <button type="submit" className={`${styles.submitButton} ${styles.create}`}>
                  Create & Enter
                </button>
                <button 
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className={styles.modalOverlay} onClick={() => setShowJoinModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Join Friend's Room</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setShowJoinModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoinRoom} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="room-code">Room Code</label>
                <input
                  id="room-code"
                  type="text"
                  placeholder="e.g., XYZ-123"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength="7"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="join-password">Password</label>
                <input
                  id="join-password"
                  type="password"
                  placeholder="Enter room password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.modalButtons}>
                <button type="submit" className={`${styles.submitButton} ${styles.join}`}>
                  Join Match
                </button>
                <button 
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomRoom;
