import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Property {
  property_id: string;
  title: string;
  location: string;
  price_per_month: string;
  room_type: string;
  image_url: string | null;
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth and Role State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLandlord, setIsLandlord] = useState(false);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Decode JWT to check for landlord role
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.data?.role || payload.role;
        setIsLandlord(role === 'landlord');
      } catch (e) {
        setIsLandlord(false);
      }
    }

    // Fetch listings
    fetch('[http://studentrent.infinityfree.io](http://studentrent.infinityfree.io)/api/properties/read.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setProperties(data.data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsLandlord(false);
    navigate('/login');
  };

  const filteredProperties = properties.filter((prop) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      prop.location.toLowerCase().includes(lowerCaseQuery) ||
      prop.title.toLowerCase().includes(lowerCaseQuery)
    );
  });

  return (
    <div className="min-h-screen bg-charcoal text-white">
      {/* Navbar */}
      <nav className="relative border-b border-gray-800 bg-charcoal-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="text-xl font-bold tracking-tight">
            Student<span className="text-forest-green-light">Rent</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {isLandlord && (
                  <Link to="/dashboard" className="text-sm font-medium text-gray-200 transition-colors hover:text-white">
                    Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="rounded-std border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-charcoal">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-200 transition-colors hover:text-white">
                  Sign In
                </Link>
                <Link to="/register" className="rounded-std bg-icy-blue-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-green">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="md:hidden p-2 text-gray-200 hover:text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-50 border-b border-gray-800 bg-charcoal-card px-6 py-4 shadow-lg md:hidden">
            <div className="flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  {isLandlord && (
                    <Link to="/dashboard" className="block text-base font-medium text-gray-200 hover:text-white">
                      Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full rounded-std border border-gray-700 px-4 py-2 text-left text-base font-medium text-gray-200 hover:bg-charcoal">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-base font-medium text-gray-200 hover:text-white">
                    Sign In
                  </Link>
                  <Link to="/register" className="block w-full rounded-std bg-icy-blue-dark px-4 py-2 text-center text-base font-medium text-white hover:bg-forest-green">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="border-b border-gray-800 bg-charcoal-card px-4 py-12 text-center md:px-6 md:py-16">
        <h1 className="text-3xl font-bold md:text-5xl">
          Find student accommodation that feels like home.
        </h1>
        <p className="mt-4 text-base text-charcoal-muted md:text-lg">
          Browse verified listings, connect with landlords, and secure your perfect space near campus.
        </p>
        
        {/* Functional Search Bar */}
        <div className="mx-auto mt-8 flex max-w-2xl gap-2 rounded-std border border-gray-700 bg-charcoal p-2 shadow-clean">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location or title..."
            className="flex-1 rounded-std bg-charcoal px-4 py-2 text-sm outline-none placeholder-charcoal-muted md:text-base"
          />
        </div>
      </section>

      {/* Listings */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold md:text-2xl">Available Properties</h2>
          <span className="text-sm text-charcoal-muted">
            {filteredProperties.length} results
          </span>
        </div>
        
        {isLoading ? (
          <p className="text-charcoal-muted">Loading...</p>
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-std border border-gray-800 py-12 text-center text-charcoal-muted">
            No properties match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((prop) => (
              <Link to={`/property/${prop.property_id}`} key={prop.property_id}>
                <div className="overflow-hidden rounded-std border border-gray-800 bg-charcoal-card shadow-clean transition-transform hover:-translate-y-1">
                  <div className="relative h-48 w-full bg-gray-800">
                    <img 
                      src={prop.image_url 
                        ? `[http://studentrent.infinityfree.io](http://studentrent.infinityfree.io)/${prop.image_url}` 
                        : 'https://placehold.co/600x400/252525/A3A3A3?text=No+Image'} 
                      alt={prop.title}
                      className="h-full w-full object-cover opacity-90 transition-opacity hover:opacity-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/252525/A3A3A3?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{prop.title}</h3>
                    <p className="text-sm text-charcoal-muted">{prop.location}</p>
                    <p className="mt-2 font-bold text-forest-green-light">R {prop.price_per_month} / mo</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}