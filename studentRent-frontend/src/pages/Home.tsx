import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl, fallbackPropertyPhotos, propertyImageUrl } from '../lib/api';

interface Property {
  property_id: string;
  title: string;
  location: string;
  price_per_month: string;
  room_type: string;
  image_url: string | null;
}

function formatPrice(price: string | number): string {
  const amount = Number(price || 0);
  return Number.isFinite(amount) ? amount.toLocaleString('en-ZA') : String(price);
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    fetch(apiUrl('/api/properties/read.php'))
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Listings could not be loaded.');
        return data;
      })
      .then((data) => {
        if (!active) return;
        setProperties(Array.isArray(data.data) ? data.data : []);
        setLoadError('');
      })
      .catch(() => {
        if (active) setLoadError('We could not connect to the listings right now. Please try again in a moment.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, []);

  const query = searchQuery.trim().toLowerCase();
  const filteredProperties = properties.filter((property) => (
    (property.title || '').toLowerCase().includes(query) ||
    (property.location || '').toLowerCase().includes(query)
  ));

  return (
    <div className="home-page">
      <section className="hero">
        <img className="hero-photo" src="/images/photo-1600607687939-ce8a6c25118c.jpg" alt="" />
        <div className="hero-shade" />
        <div className="hero-inner page-container">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" />A better start to student life</div>
            <h1>Find a place to feel <em>at home.</em></h1>
            <p>Explore student accommodation, compare monthly rent and find a space that fits your life near campus.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#properties">Explore accommodation <span aria-hidden="true">↗</span></a>
              <Link className="button button-light" to="/register">List your property</Link>
            </div>
            <div className="hero-note"><span className="note-mark">✓</span> Your next chapter starts with the right home.</div>
          </div>
          <div className="hero-photo-caption"><span className="caption-dot" /> A place to settle in and thrive</div>
        </div>
      </section>

      <section className="search-section page-container" aria-label="Find accommodation">
        <div className="search-card">
          <div className="search-intro">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <div><strong>Find your space</strong><span>Search by property or area</span></div>
          </div>
          <label className="search-input-wrap">
            <span className="sr-only">Search properties or locations</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Try Observatory, Bellville..."
            />
          </label>
          <a className="button button-dark search-button" href="#properties">Search homes</a>
        </div>
      </section>

      <section className="trust-section page-container" aria-label="About StudentRent">
        <div className="trust-item">
          <span className="trust-icon" aria-hidden="true">⌂</span>
          <div><strong>Made for student life</strong><span>Browse accommodation in one place</span></div>
        </div>
        <div className="trust-item">
          <span className="trust-icon" aria-hidden="true">R</span>
          <div><strong>Clear monthly pricing</strong><span>Compare rent before you enquire</span></div>
        </div>
        <div className="trust-item">
          <span className="trust-icon" aria-hidden="true">↗</span>
          <div><strong>Talk to landlords</strong><span>Open a listing to get in touch</span></div>
        </div>
      </section>

      <section className="listings-section page-container" id="properties">
        <div className="section-heading">
          <div>
            <div className="eyebrow eyebrow-dark"><span className="eyebrow-line" />Find your next place</div>
            <h2>Accommodation to make your own</h2>
            <p>Explore the spaces currently listed on StudentRent.</p>
          </div>
          <span className="listing-count">{filteredProperties.length} {filteredProperties.length === 1 ? 'home' : 'homes'}</span>
        </div>

        {isLoading ? (
          <div className="loading-panel"><span className="loading-spinner" /> Loading accommodation...</div>
        ) : loadError ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">⌂</span>
            <h3>Listings are taking a little longer</h3>
            <p>{loadError}</p>
            <button className="button button-outline" onClick={() => window.location.reload()}>Try again</button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">⌕</span>
            <h3>{properties.length ? 'No homes match that search' : 'No properties are listed yet'}</h3>
            <p>{properties.length ? 'Try a different property name or area.' : 'New student accommodation will appear here when it is listed.'}</p>
            {query && <button className="button button-outline" onClick={() => setSearchQuery('')}>Clear search</button>}
          </div>
        ) : (
          <div className="property-grid">
            {filteredProperties.map((property, index) => {
              const fallback = fallbackPropertyPhotos[index % fallbackPropertyPhotos.length];
              return (
                <Link className="property-card" to={'/property/' + property.property_id} key={property.property_id}>
                  <div className="property-image">
                    <img
                      src={propertyImageUrl(property.image_url, fallback)}
                      alt={property.title + ' accommodation'}
                      loading="lazy"
                      onError={(event) => { event.currentTarget.src = fallback; }}
                    />
                    <span className="property-badge">Student accommodation</span>
                    <span className="image-arrow" aria-hidden="true">↗</span>
                  </div>
                  <div className="property-body">
                    <div className="property-type">{property.room_type || 'Accommodation'}</div>
                    <h3>{property.title}</h3>
                    <p className="property-location"><span aria-hidden="true">⌖</span>{property.location}</p>
                    <div className="property-card-footer">
                      <div className="property-price">R {formatPrice(property.price_per_month)}<span> / month</span></div>
                      <span className="view-link">View home <span aria-hidden="true">→</span></span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="landlord-cta">
        <div className="page-container landlord-cta-inner">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" />For property owners</div>
            <h2>Have a room for a student?</h2>
            <p>Share your accommodation with students looking for their next home.</p>
          </div>
          <Link className="button button-primary" to="/dashboard">Manage your listings <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
