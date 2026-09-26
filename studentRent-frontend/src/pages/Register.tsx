import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../lib/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'landlord'>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Your password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(apiUrl('/api/users/register.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch {
      setError('We could not reach StudentRent. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-visual register-visual">
        <div className="auth-visual-content">
          <div className="eyebrow"><span className="eyebrow-line" />Make yourself at home</div>
          <h1>Your next chapter starts here.</h1>
          <p>Create your StudentRent account to browse available spaces or share accommodation with students.</p>
        </div>
      </div>
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="eyebrow eyebrow-dark"><span className="eyebrow-line" />Get started</div>
          <h2>Create your account</h2>
          <p>It only takes a minute to join StudentRent.</p>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}

        <form onSubmit={handleRegister} className="form-stack">
          <div className="form-field">
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              className="form-control"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="form-field">
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
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
            <label>I am joining as a</label>
            <div className="role-choice-grid" role="group" aria-label="Account type">
              <button type="button" className={role === 'student' ? 'role-choice selected' : 'role-choice'} onClick={() => setRole('student')}>
                Student
              </button>
              <button type="button" className={role === 'landlord' ? 'role-choice selected' : 'role-choice'} onClick={() => setRole('landlord')}>
                Landlord
              </button>
            </div>
          </div>
          <div className="form-two-col">
            <div className="form-field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                className="form-control"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="form-field">
              <label htmlFor="register-confirm">Confirm password</label>
              <input
                id="register-confirm"
                className="form-control"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter it again"
              />
            </div>
          </div>
          <button className="button button-primary button-block" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link className="text-link" to="/login">Sign in</Link></p>
      </div>
    </section>
  );
}
