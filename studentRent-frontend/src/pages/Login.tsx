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
      const response = await fetch('[http://studentrent.infinityfree.io](http://studentrent.infinityfree.io)/api/users/login.php', {
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-charcoal">
      <div className="w-full max-w-md rounded-std border border-gray-200 bg-white p-8 shadow-clean dark:border-gray-800 dark:bg-charcoal-card">
        
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold tracking-tight text-charcoal-text dark:text-white">
            Student<span className="text-forest-green dark:text-forest-green-light">Rent</span>
          </Link>
          <p className="mt-2 text-sm text-charcoal-muted">Find your place to call home.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-std border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-text dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-std border border-gray-300 px-3 py-2 outline-none focus:border-icy-blue-dark focus:ring-1 focus:ring-icy-blue-dark dark:border-gray-700 dark:bg-charcoal dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-text dark:text-gray-200">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-std border border-gray-300 px-3 py-2 outline-none focus:border-icy-blue-dark focus:ring-1 focus:ring-icy-blue-dark dark:border-gray-700 dark:bg-charcoal dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-std bg-icy-blue-dark py-2.5 font-medium text-white transition-colors hover:bg-forest-green"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-charcoal-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-forest-green hover:underline dark:text-forest-green-light">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}