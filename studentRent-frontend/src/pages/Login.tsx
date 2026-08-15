import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://studentrent.infinityfree.io/api/users/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Save the token and redirect to home
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal text-white">
      <div className="w-full max-w-md rounded-std border border-gray-800 bg-charcoal-card p-8 shadow-clean">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Student<span className="text-forest-green-light">Rent</span>
          </h1>
          <p className="mt-2 text-sm text-charcoal-muted">Find your place to call home.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-std border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-200">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-std border border-gray-700 bg-charcoal px-4 py-2.5 outline-none focus:border-forest-green-light"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-200">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-std border border-gray-700 bg-charcoal px-4 py-2.5 outline-none focus:border-forest-green-light"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-std bg-icy-blue-dark py-3 font-medium text-white transition-colors hover:bg-forest-green"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-forest-green-light hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}