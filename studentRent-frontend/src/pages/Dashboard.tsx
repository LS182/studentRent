import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface Property {
  property_id: string;
  title: string;
  location: string;
  price_per_month: string;
  room_type: string;
  image_url: string | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [roomType, setRoomType] = useState('apartment');
  const [image, setImage] = useState<File | null>(null);
  
  // UI State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Listings State
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [isFetchingListings, setIsFetchingListings] = useState(true);

  // Helper to decode JWT and find user role
  const getUserRole = (token: string | null) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.data?.role || payload.role || null;
    } catch (e) {
      return null;
    }
  };

  const fetchListings = () => {
    setIsFetchingListings(true);
    fetch('http://studentrent.infinityfree.io/api/properties/read.php')
      .then(res => res.json())
      .then(data => {
        if (data.data) setMyProperties(data.data);
        setIsFetchingListings(false);
      })
      .catch(() => setIsFetchingListings(false));
  };

  // Protect the route: Kick if no token, OR if token role is not 'landlord'
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const role = getUserRole(token);
    if (role !== 'landlord') {
      alert("Access Denied: Only landlords can view the dashboard.");
      navigate('/');
    } else {
      fetchListings();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const token = localStorage.getItem('token');

    try {
      // STEP 1: Create the property record via JSON
      const createResponse = await fetch('http://studentrent.infinityfree.io/api/properties/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          price, // Sent as "price" to match PHP backend expectations
          location,
          room_type: roomType
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.message || 'Failed to create property.');
      }

      // STEP 2: Upload image if selected
      if (image && createData.property_id) {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('property_id', createData.property_id);

        const uploadResponse = await fetch('http://studentrent.infinityfree.io/api/properties/upload_image.php', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Property created, but image upload failed.');
        }
      }

      setSuccess('Property listed successfully!');
      setTitle('');
      setDescription('');
      setPrice('');
      setLocation('');
      setRoomType('apartment');
      setImage(null);
      
      // Refresh the table
      fetchListings();

    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://studentrent.infinityfree.io/api/properties/delete.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ property_id: id }),
      });

      if (response.ok) {
        setMyProperties(prev => prev.filter(p => p.property_id !== id));
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete.');
      }
    } catch (err) {
      alert('Server error during deletion.');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-charcoal-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Student<span className="text-forest-green-light">Rent</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-gray-200 transition-colors hover:text-white">
              View Listings
            </Link>
            <button 
              onClick={handleLogout}
              className="rounded-std border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-charcoal"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Layout */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold">Landlord Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Create Listing Form */}
          <div className="h-fit rounded-std border border-gray-800 bg-charcoal-card p-6 shadow-clean lg:col-span-1">
            <h2 className="mb-4 text-lg font-semibold">Create New Listing</h2>
            
            {error && <div className="mb-4 rounded-std border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">{error}</div>}
            {success && <div className="mb-4 rounded-std border border-green-900/50 bg-green-950/30 p-3 text-sm text-green-400">{success}</div>}

            <form onSubmit={handleCreateProperty} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Property Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-std border border-gray-700 bg-charcoal px-3 py-2 outline-none focus:border-forest-green-light" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Description</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-std border border-gray-700 bg-charcoal px-3 py-2 outline-none focus:border-forest-green-light" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-200">Price (R)</label>
                  <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-std border border-gray-700 bg-charcoal px-3 py-2 outline-none focus:border-forest-green-light" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-200">Location</label>
                  <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-std border border-gray-700 bg-charcoal px-3 py-2 outline-none focus:border-forest-green-light" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Room Type</label>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="w-full rounded-std border border-gray-700 bg-charcoal px-3 py-2 outline-none focus:border-forest-green-light">
                  <option value="apartment">Apartment</option>
                  <option value="single">Single Room</option>
                  <option value="sharing">Sharing Room</option>
                  <option value="studio">Studio</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Property Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} 
                  className="w-full rounded-std border border-gray-700 bg-charcoal px-3 py-2 text-sm text-gray-300 file:mr-4 file:rounded-std file:border-0 file:bg-gray-800 file:px-4 file:py-1 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-700" 
                />
              </div>

              <button type="submit" disabled={isLoading} className="mt-4 w-full rounded-std bg-icy-blue-dark py-2.5 font-medium text-white transition-colors hover:bg-forest-green disabled:opacity-50">
                {isLoading ? 'Publishing...' : 'Publish Listing'}
              </button>
            </form>
          </div>

          {/* Management Table */}
          <div className="h-fit rounded-std border border-gray-800 bg-charcoal-card p-6 shadow-clean lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Manage My Listings</h2>
            
            {isFetchingListings ? (
              <p className="text-charcoal-muted">Loading properties...</p>
            ) : myProperties.length === 0 ? (
              <div className="rounded-std border border-gray-800 py-12 text-center text-charcoal-muted">
                You haven't posted any properties yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-charcoal text-xs uppercase text-gray-400">
                    <tr>
                      <th className="rounded-tl-std px-4 py-3">Property</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="rounded-tr-std px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProperties.map((prop) => (
                      <tr key={prop.property_id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="line-clamp-1 px-4 py-3 font-medium text-white">{prop.title}</td>
                        <td className="px-4 py-3">{prop.location}</td>
                        <td className="px-4 py-3">R {prop.price_per_month}</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleDelete(prop.property_id)}
                            className="text-red-400 hover:text-red-300 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}