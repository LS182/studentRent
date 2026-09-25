import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl, fallbackPropertyPhotos, propertyImageUrl } from '../lib/api';

interface Property {
  property_id: string;
  title: string;
  location: string;
  price_per_month: string;
  room_type: string;
  image_url: string | null;
}

function getUserRole(token: string | null): string | null {
  if (!token) return null;
  try {
    const unpaddedPart = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payloadPart = unpaddedPart.padEnd(Math.ceil(unpaddedPart.length / 4) * 4, '=');
    const payload = JSON.parse(atob(payloadPart));
    return payload.data?.role || payload.role || null;
  } catch {
    return null;
  }
}

function formatPrice(price: string): string {
  const amount = Number(price || 0);
  return Number.isFinite(amount) ? amount.toLocaleString('en-ZA') : price;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [roomType, setRoomType] = useState('apartment');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [isFetchingListings, setIsFetchingListings] = useState(true);

  const fetchListings = useCallback(() => {
    setIsFetchingListings(true);
    fetch(apiUrl('/api/properties/read.php'))
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.data)) setMyProperties(data.data);
      })
      .catch(() => undefined)
      .finally(() => setIsFetchingListings(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (getUserRole(token) !== 'landlord') {
      navigate('/');
      return;
    }
    fetchListings();
  }, [navigate, fetchListings]);

  const handleCreateProperty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    const token = localStorage.getItem('token');

    try {
      const createResponse = await fetch(apiUrl('/api/properties/create.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          title,
          description,
          price,
          location,
          room_type: roomType,
        }),
      });
      const createData = await createResponse.json();
      if (!createResponse.ok) throw new Error(createData.message || 'Failed to create property.');

      if (image && createData.property_id) {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('property_id', createData.property_id);

        const uploadResponse = await fetch(apiUrl('/api/properties/upload_image.php'), {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Property created, but the image upload failed.');
      }

      setSuccess('Your property was listed successfully.');
      setTitle('');
      setDescription('');
      setPrice('');
      setLocation('');
      setRoomType('apartment');
      setImage(null);
      const fileInput = document.getElementById('property-image') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      fetchListings();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(apiUrl('/api/properties/delete.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ property_id: id }),
      });

      if (response.ok) {
        setMyProperties((previous) => previous.filter((property) => property.property_id !== id));
      } else {
        const data = await response.json();
        window.alert(data.message || 'The listing could not be deleted.');
      }
    } catch {
      window.alert('Server error while deleting the listing.');
    }
  };

  const photoCount = myProperties.filter((property) => property.image_url).length;

  return (
    <div className="dashboard-page page-container">
      <div className="page-heading">
        <div>
          <div className="eyebrow eyebrow-dark"><span className="eyebrow-line" />Landlord workspace</div>
          <h1>Your property dashboard</h1>
          <p>Publish accommodation and keep your listings up to date.</p>
        </div>
      </div>

      <div className="dashboard-stat-grid">
        <div className="dashboard-stat"><span>Listings loaded</span><strong>{myProperties.length}</strong></div>
        <div className="dashboard-stat"><span>Listings with photos</span><strong>{photoCount}</strong></div>
        <div className="dashboard-stat"><span>Account type</span><strong className="stat-role">Landlord</strong></div>
      </div>

      <div className="dashboard-layout">
        <section className="dashboard-panel">
          <h2>Add accommodation</h2>
          <p className="panel-subtitle">Share the key details students need to discover your space.</p>

          {error && <div className="form-error" role="alert">{error}</div>}
          {success && <div className="form-success" role="status">{success}</div>}

          <form onSubmit={handleCreateProperty} className="property-form">
            <div className="form-field">
              <label htmlFor="property-title">Property title</label>
              <input id="property-title" className="form-control" type="text" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Sunny room near campus" />
            </div>
            <div className="form-field">
              <label htmlFor="property-description">Description</label>
              <textarea id="property-description" className="form-control" required value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Describe the accommodation and what makes it a good place to live." />
            </div>
            <div className="form-two-col">
              <div className="form-field">
                <label htmlFor="property-price">Monthly rent (R)</label>
                <input id="property-price" className="form-control" type="number" min="0" required value={price} onChange={(event) => setPrice(event.target.value)} placeholder="4500" />
              </div>
              <div className="form-field">
                <label htmlFor="property-location">Area</label>
                <input id="property-location" className="form-control" type="text" required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Observatory" />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="property-room-type">Room type</label>
              <select id="property-room-type" className="form-control" value={roomType} onChange={(event) => setRoomType(event.target.value)}>
                <option value="apartment">Apartment</option>
                <option value="single">Single room</option>
                <option value="sharing">Shared room</option>
                <option value="studio">Studio</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="property-image">Property photo</label>
              <input
                id="property-image"
                className="file-control"
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] || null)}
              />
            </div>
            <button className="button button-primary button-block" type="submit" disabled={isLoading}>
              {isLoading ? 'Publishing...' : 'Publish listing'}
            </button>
          </form>
        </section>

        <section className="dashboard-panel">
          <h2>Your listings</h2>
          <p className="panel-subtitle">Review the accommodation currently available in your account.</p>

          {isFetchingListings ? (
            <div className="loading-panel"><span className="loading-spinner" /> Loading listings...</div>
          ) : myProperties.length === 0 ? (
            <div className="dashboard-empty">Your published accommodation will appear here. Add your first listing using the form.</div>
          ) : (
            <div className="dashboard-list">
              {myProperties.map((property, index) => {
                const fallback = fallbackPropertyPhotos[index % fallbackPropertyPhotos.length];
                return (
                  <article className="dashboard-property" key={property.property_id}>
                    <img
                      src={propertyImageUrl(property.image_url, fallback)}
                      alt=""
                      onError={(event) => { event.currentTarget.src = fallback; }}
                    />
                    <div>
                      <h3>{property.title}</h3>
                      <p>{property.location} · R {formatPrice(property.price_per_month)} / month</p>
                    </div>
                    <button className="button button-outline button-small" type="button" onClick={() => handleDelete(property.property_id)}>Delete</button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
