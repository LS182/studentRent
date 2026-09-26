import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

function readRole(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const unpaddedPayload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const encodedPayload = unpaddedPayload.padEnd(Math.ceil(unpaddedPayload.length / 4) * 4, '=');
    const payload = JSON.parse(atob(encodedPayload));
    return payload.data?.role || payload.role || 'student';
  } catch {
    return 'student';
  }
}

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="StudentRent home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M3.5 10.3 12 3.5l8.5 6.8v9.2a1 1 0 0 1-1 1h-5.2v-6.1H9.7v6.1H4.5a1 1 0 0 1-1-1v-9.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
        <span />
      </span>
      <span>Student<span className="brand-accent">Rent</span></span>
    </Link>
  );
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string | null>(readRole);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setRole(readRole());
    setMenuOpen(false);
  }, [location.pathname]);

  const signOut = () => {
    localStorage.removeItem('token');
    setRole(null);
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="main-nav" aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
            <Link className="nav-link" to="/#properties">Listings</Link>
            {role === 'landlord' && (
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
            )}
          </nav>
          <div className="header-actions">
            {role ? (
              <>
                <span className="account-label">{role === 'landlord' ? 'Landlord account' : 'Student account'}</span>
                <button className="button button-quiet" onClick={signOut}>Sign out</button>
              </>
            ) : (
              <>
                <Link className="button button-quiet" to="/login">Sign in</Link>
                <Link className="button button-primary" to="/register">Get started</Link>
              </>
            )}
          </div>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen
                ? <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
            <Link to="/#properties" onClick={() => setMenuOpen(false)}>Listings</Link>
            {role === 'landlord' && <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>}
            {role ? (
              <button onClick={signOut}>Sign out</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>Create account</Link>
              </>
            )}
          </nav>
        )}
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="footer-inner">
          <Brand />
          <p>Student accommodation, with comfort and clear pricing at the centre.</p>
          <span>© {new Date().getFullYear()} StudentRent</span>
        </div>
      </footer>
    </div>
  );
}
