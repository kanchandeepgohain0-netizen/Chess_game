import { useState } from 'react';
import styles from './CustomRoom.module.css';
import socket from '../services/socket';

function CustomRoom({ navigateTo }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [error, setError] = useState('');

  // Create Room Form
  const [createFormat, setCreateFormat] = useState('classical');
  const [createPassword, setCreatePassword] = useState('');

  // Join Room Form
  const [roomCode, setRoomCode] = useState('');
  const [joinPassword, setJoinPassword] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api/rooms/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ password: createPassword, format: createFormat })
      });
      const data = await res.json();
      if (res.status === 401) {
        localStorage.clear();
        navigateTo('login');
        return;
      }
      if (!res.ok) { setError(data.error || 'Failed to create room'); return; }

      localStorage.setItem('roomId', data.roomId);
      localStorage.setItem('myColor', 'white');
      localStorage.setItem('gameFormat', createFormat);
      localStorage.setItem('isBotGame', 'false');
      localStorage.removeItem('gameId'); // clear any stale gameId

      // Ensure socket is connected before emitting
      if (!socket.connected) socket.connect();

      // Register user and join the room socket channel
      socket.emit('register_user', { userId: user.userId });
      socket.emit('join_room', { roomId: data.roomId, userId: user.userId });

      // Navigate immediately — Game.jsx will handle room_ready
      setShowCreateModal(false);
      setCreatePassword('');
      navigateTo('game', createFormat);
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ roomId: roomCode, password: joinPassword })
      });
      const data = await res.json();
      if (res.status === 401) {
        if (data.error === 'Incorrect room password.') {
          setError(data.error);
          return;
        }
        localStorage.clear();
        navigateTo('login');
        return;
      }
      if (!res.ok) { setError(data.error || 'Failed to join room'); return; }

      localStorage.setItem('roomId', roomCode);
      localStorage.setItem('myColor', 'black');
      localStorage.setItem('isBotGame', 'false');
      localStorage.removeItem('gameId'); // clear any stale gameId

      // Ensure socket is connected before emitting
      if (!socket.connected) socket.connect();

      socket.emit('register_user', { userId: user.userId });
      socket.emit('join_room', { roomId: roomCode, userId: user.userId });

      // Navigate immediately — Game.jsx will handle room_ready
      setShowJoinModal(false);
      setRoomCode('');
      setJoinPassword('');
      navigateTo('game', 'rapid');
    } catch (err) {
      setError('Network error. Please try again.');
    }
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
        {error && <p style={{ color: '#ff6060', textAlign: 'center', marginBottom: '12px', fontSize: '0.9rem' }}>{error}</p>}

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
