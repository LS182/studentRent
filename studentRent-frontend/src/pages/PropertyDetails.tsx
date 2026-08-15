import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

interface Property {
  property_id: string;
  title: string;
  description: string;
  location: string;
  price_per_month: string;
  room_type: string;
  image_url: string | null;
  landlord_phone?: string; // Optional for now until the backend provides it
}

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is logged in
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Fetch properties
    fetch('http://studentrent.infinityfree.io/api/properties/read.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const found = data.data.find((p: Property) => p.property_id === id);
          setProperty(found || null);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (property) {
      // Use the landlord's real number if your DB has it, otherwise use a placeholder
      const phoneNumber = property.landlord_phone || "27600000000"; 
      
      // Construct a friendly, pre-filled message
      const message = `Hi! I saw your listing for "${property.title}" in ${property.location} on StudentRent. Is it still available?`;
      
      // Encode the text so it forms a valid URL, then open WhatsApp in a new tab
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-charcoal text-white">Loading...</div>;
  }

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-charcoal text-white">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <button onClick={() => navigate('/')} className="mt-4 text-forest-green-light hover:underline">
          Go back home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-charcoal-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Student<span className="text-forest-green-light">Rent</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-gray-200 transition-colors hover:text-white">
            ← Back to Search
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Massive Hero Image */}
        <div className="mb-8 aspect-video w-full overflow-hidden rounded-std bg-gray-800 shadow-clean">
          <img 
            src={property.image_url 
              ? `http://studentrent.infinityfree.io/${property.image_url}` 
              : 'https://placehold.co/1200x600/252525/A3A3A3?text=No+Image+Available'} 
            alt={property.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/1200x600/252525/A3A3A3?text=Image+Not+Found';
            }}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          
          {/* Main Details (Left/Top) */}
          <div className="md:col-span-2">
            <div className="mb-4 inline-block rounded-std bg-gray-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
              {property.room_type || 'Accommodation'}
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">{property.title}</h1>
            <p className="mt-2 flex items-center text-lg text-charcoal-muted">
              📍 {property.location}
            </p>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold">About this property</h2>
              <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-300">
                {property.description}
              </p>
            </div>
          </div>

          {/* Pricing & Contact Card (Right/Bottom) */}
          <div className="relative">
            <div className="sticky top-6 rounded-std border border-gray-800 bg-charcoal-card p-6 shadow-clean">
              <div className="mb-6">
                <span className="text-3xl font-bold text-forest-green-light">R {property.price_per_month}</span>
                <span className="text-charcoal-muted"> / month</span>
              </div>
              
              <button 
                onClick={handleContact}
                className="w-full rounded-std bg-icy-blue-dark py-3 font-medium text-white transition-colors hover:bg-forest-green flex justify-center items-center gap-2"
              >
                {/* Optional: A little WhatsApp icon */}
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.656.848 5.143 2.454 7.22l-1.636 5.975 6.125-1.607c2.02.1.002.5.002.5h.001c6.646 0 12.031-5.385 12.031-12.031C24.062 5.385 18.677 0 12.031 0zm3.625 17.273c-.563 1.58-2.607 2.05-3.666 2.05-1.026 0-3.32-.424-4.832-1.936-1.513-1.513-1.936-3.806-1.936-4.832 0-1.06.47-3.103 2.05-3.666.386-.14.773-.14 1.159-.14.225 0 .45.025.674.075.337.075.674.3.843.625l.843 1.686c.197.394.225.871.056 1.292-.112.28-.31.505-.562.674-.225.14-.45.337-.646.562-.14.14-.28.31-.225.534.197.618.618 1.18 1.18 1.63.562.45 1.152.815 1.77.983.225.056.45-.056.59-.225.197-.197.394-.394.534-.618.169-.253.394-.45.674-.562.422-.169.899-.14 1.292.056l1.686.843c.337.169.562.506.625.843.049.224.075.449.075.674 0 .386 0 .773-.14 1.159z" />
                </svg>
                Contact Landlord
              </button>
              
              {!isAuthenticated && (
                <p className="mt-4 text-center text-xs text-charcoal-muted">
                  You must be signed in to send messages.
                </p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}