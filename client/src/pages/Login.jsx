import { useState } from 'react';
import styles from './Login.module.css';

export default function Login({ navigateTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Store user data in localStorage
    const userData = { email, username: email.split('@')[0] };
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');

    setError('');
    navigateTo('home');
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
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Login
            </button>
          </form>

          <div className={styles.divider}></div>

          <p className={styles.switchText}>
            Don&apos;t have an account?{' '}
            <button
              onClick={() => navigateTo('register')}
              className={styles.switchLink}
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
