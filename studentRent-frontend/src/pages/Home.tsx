import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    fetch('http://localhost:8000/api/properties/read.php')
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

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl justify-between items-center">
          <div className="text-xl font-bold tracking-tight">
            Student<span className="text-forest-green">Rent</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-charcoal-text transition-colors hover:text-icy-blue-dark"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="rounded-std bg-icy-blue-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-green"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-icy-blue/10 px-6 py-16 text-center">
        <h1 className="text-4xl font-bold md:text-5xl">
          Find student accommodation that feels like home.
        </h1>
        <p className="mt-4 text-lg text-charcoal-muted">
          Browse verified listings, connect with landlords, and secure your perfect space near campus.
        </p>
      </section>

      {/* Listings */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-bold">Available Properties</h2>
        
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((prop) => (
              <div key={prop.property_id} className="rounded-std border border-gray-200 shadow-clean overflow-hidden">
                <div className="h-48 bg-gray-100 w-full relative">
                  <img 
                    src={prop.image_url ? `http://localhost:8000/${prop.image_url}` : 'https://via.placeholder.com/400x300'} 
                    alt={prop.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{prop.title}</h3>
                  <p className="text-sm text-charcoal-muted">{prop.location}</p>
                  <p className="mt-2 font-bold text-forest-green">R {prop.price_per_month} / mo</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}