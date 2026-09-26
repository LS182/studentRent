import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiUrl, fallbackPropertyPhotos, propertyImageUrl } from '../lib/api';

interface Property {
  property_id: string;
  title: string;
  description: string;
  location: string;
  price_per_month: string;
  room_type: string;
  image_url: string | null;
  landlord_phone?: string;
}

function formatPrice(price: string): string {
  const amount = Number(price || 0);
  return Number.isFinite(amount) ? amount.toLocaleString('en-ZA') : price;
}

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
    let active = true;

    fetch(apiUrl('/api/properties/read.php'))
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data.data)) {
          const found = data.data.find((item: Property) => item.property_id === id);
          setProperty(found || null);
        }
      })
      .catch(() => {
        if (active) setProperty(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!property) return;

    const phoneNumber = property.landlord_phone || '27600000000';
    const message = 'Hi! I saw your listing for "' + property.title + '" in ' + property.location + ' on StudentRent. Is it still available?';
    window.open('https://wa.me/' + phoneNumber + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return <div className="page-container details-page"><div className="loading-panel"><span className="loading-spinner" /> Loading property...</div></div>;
  }

  if (!property) {
    return (
      <div className="page-container details-page">
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">⌂</span>
          <h3>Property not found</h3>
          <p>This listing may have been removed or is no longer available.</p>
          <Link className="button button-primary" to="/">Back to accommodation</Link>
        </div>
      </div>
    );
  }

  const imageFallback = fallbackPropertyPhotos[0];

  return (
    <article className="page-container details-page">
      <Link className="back-link" to="/#properties"><span aria-hidden="true">←</span> Back to accommodation</Link>
      <div className="details-image-wrap">
        <img
          className="details-image"
          src={propertyImageUrl(property.image_url, imageFallback)}
          alt={property.title + ' accommodation'}
          onError={(event) => { event.currentTarget.src = imageFallback; }}
        />
      </div>
      <div className="details-layout">
        <div className="details-main">
          <div className="details-kicker">Student accommodation</div>
          <h1 className="details-title">{property.title}</h1>
          <p className="details-location"><span aria-hidden="true">⌖</span>{property.location}</p>
          {property.room_type && <span className="details-type">{property.room_type}</span>}
          <section className="details-section">
            <h2>About this property</h2>
            <p className="details-description">{property.description || 'Contact the landlord to learn more about this accommodation.'}</p>
          </section>
        </div>
        <aside className="details-price-card">
          <div className="details-price-label">Monthly rent</div>
          <div className="details-rent">R {formatPrice(property.price_per_month)}<span> / month</span></div>
          <button className="button button-primary button-block" type="button" onClick={handleContact}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="17" height="17">
              <path d="M12.04 2a9.87 9.87 0 0 0-8.46 14.96L2 22l5.2-1.53A9.95 9.95 0 1 0 12.04 2Zm0 18.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.09.9.93-3.01-.2-.31a8.13 8.13 0 1 1 6.79 3.73Zm4.46-6.08c-.24-.12-1.43-.7-1.66-.78-.22-.08-.39-.12-.55.12-.16.24-.63.78-.77.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.21-1.43-1.35-1.67-.14-.24-.01-.37.1-.49.11-.1.24-.27.36-.41.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.43h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.59 4.12 3.63.58.25 1.03.4 1.38.51.58.18 1.11.15 1.53.09.47-.07 1.43-.59 1.63-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28Z" />
            </svg>
            Contact landlord
          </button>
          {!isAuthenticated && <p className="details-contact-note">Sign in to continue to the landlord’s contact link.</p>}
          <p className="details-contact-note">Ask about availability, viewing times and any additional costs.</p>
        </aside>
      </div>
    </article>
  );
}
