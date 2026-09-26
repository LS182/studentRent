import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl('/api/users/login.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch {
      setError('We could not reach StudentRent. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="eyebrow"><span className="eyebrow-line" />Welcome to StudentRent</div>
          <h1>Good to have you home.</h1>
          <p>Sign in to continue exploring student accommodation and manage your property listings.</p>
        </div>
      </div>
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="eyebrow eyebrow-dark"><span className="eyebrow-line" />Your account</div>
          <h2>Welcome back</h2>
          <p>Enter your details to sign in to StudentRent.</p>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}

        <form onSubmit={handleLogin} className="form-stack">
          <div className="form-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              className="form-control"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-control"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <button className="button button-primary button-block" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">New to StudentRent? <Link className="text-link" to="/register">Create an account</Link></p>
      </div>
    </section>
  );
}
