import { useState } from 'react';
import styles from './Login.module.css';
import socket from '../services/socket';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function Login({ navigateTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Store everything the app needs — including userId and elo
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        userId: String(data.userId),   // MongoDB _id as string
        username: data.username,
        elo: data.elo ?? 1200
      }));
      localStorage.setItem('isLoggedIn', 'true');


      if (!socket.connected) socket.connect();
      socket.emit('register_user', { userId: String(data.userId) });

      navigateTo('home');
    } catch (err) {
      console.error('Login error:', err);
      setError('Cannot reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>ChessHub</h1>
          <p className={styles.subtitle}>Welcome Back</p>

          <form onSubmit={handleLogin} className={styles.form}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                disabled={loading}
              />
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <div className={styles.divider}></div>

          <p className={styles.switchText}>
            Don&apos;t have an account?{' '}
            <button onClick={() => navigateTo('register')} className={styles.switchLink}>
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
