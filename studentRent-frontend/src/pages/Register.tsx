import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'landlord'>('student');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://studentrent.infinityfree.io/api/users/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      
      const data = await response.json();

      if (response.ok) {
        // Redirect to login on success
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-charcoal">
      <div className="w-full max-w-md rounded-std border border-gray-200 bg-white p-8 shadow-clean dark:border-gray-800 dark:bg-charcoal-card">
        
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold tracking-tight text-charcoal-text dark:text-white">
            Student<span className="text-forest-green dark:text-forest-green-light">Rent</span>
          </Link>
          <p className="mt-2 text-sm text-charcoal-muted">Create an account to get started.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-std border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-text dark:text-gray-200">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-std border border-gray-300 px-3 py-2 outline-none focus:border-icy-blue-dark focus:ring-1 focus:ring-icy-blue-dark dark:border-gray-700 dark:bg-charcoal dark:text-white"
            />
          </div>

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

          {/* Role Selector */}
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-text dark:text-gray-200">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`rounded-std border py-2 text-sm font-medium transition-colors ${
                  role === 'student'
                    ? 'border-icy-blue-dark bg-icy-blue-dark/10 text-charcoal-text dark:text-white'
                    : 'border-gray-200 text-charcoal-muted hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-charcoal'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('landlord')}
                className={`rounded-std border py-2 text-sm font-medium transition-colors ${
                  role === 'landlord'
                    ? 'border-forest-green bg-forest-green/10 text-forest-green dark:text-forest-green-light'
                    : 'border-gray-200 text-charcoal-muted hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-charcoal'
                }`}
              >
                Landlord
              </button>
            </div>
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

          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-text dark:text-gray-200">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-std border border-gray-300 px-3 py-2 outline-none focus:border-icy-blue-dark focus:ring-1 focus:ring-icy-blue-dark dark:border-gray-700 dark:bg-charcoal dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-std bg-icy-blue-dark py-2.5 font-medium text-white transition-colors hover:bg-forest-green disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-charcoal-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-forest-green hover:underline dark:text-forest-green-light">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}