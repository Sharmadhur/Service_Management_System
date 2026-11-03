import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const categories = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Technician', 'Mechanic',
  'Cleaner', 'Gardener', 'Construction Labor', 'Moving Labor', 'House Helper', 'Other',
];

const StarDisplay = ({ rating = 0 }) => {
  const filled = Math.round(rating || 0);
  return (
    <span className="inline-flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < filled ? 'text-amber-500' : 'text-stone-300'}>★</span>
      ))}
      <span className="ml-1 text-sm text-stone-600 dark:text-stone-300">{Number(rating || 0).toFixed(1)}</span>
    </span>
  );
};

export default function RequestWorker() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [form, setForm] = useState({
    category: categories[0],
    description: '',
    address: '',
    city: '',
    preferredDate: '',
    preferredTime: '',
    radius: 20,
    lat: null,
    lng: null,
  });

  const findCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser. Please enter city/address manually.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        toast.success('Current location detected successfully.');
      },
      () => {
        toast.error('Location access was denied. You can still search by city manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const searchWorkers = async (e) => {
    e.preventDefault();
    setSearching(true);
    try {
      const { data } = await api.get('/customer/searchNearbyWorkers', {
        params: {
          category: form.category,
          city: form.city,
          lat: form.lat ?? null,
          lng: form.lng ?? null,
          radius: form.radius,
          limit: 12,
        },
      });

      setWorkers(data.workers || []);
      if (!data.workers?.length) {
        toast.info('No nearby workers match your search. Try a wider radius or a different city.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not search nearby workers');
    } finally {
      setSearching(false);
    }
  };

  const confirmSelection = async () => {
    if (!selectedWorker) return;

    setLoading(true);
    try {
      const { data } = await api.post('/customer/selectWorker', {
        ...form,
        workerId: selectedWorker._id,
      });
      toast.success(`Request created for ${selectedWorker.userId?.name || 'selected worker'}!`);
      navigate('/customer/requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not assign the selected worker');
    } finally {
      setLoading(false);
      setSelectedWorker(null);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-1">Request a worker</h2>
        <p className="text-sm text-stone-500 mb-6">Choose a category, set your service location, and pick the worker you want.</p>

        <form onSubmit={searchWorkers} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Service category</label>
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Job description</label>
            <textarea className="input-field" rows={4} required placeholder="Describe the task" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Service address</label>
            <input className="input-field" required placeholder="House no / street / landmark" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="text-sm font-medium mb-1 block">City</label>
              <input className="input-field" placeholder="e.g. Chennai" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <button type="button" className="btn-secondary h-[46px]" onClick={findCurrentLocation}>Use my location</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Preferred date</label>
              <input className="input-field" type="date" required value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Preferred time</label>
              <input className="input-field" type="time" required value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Search radius: {form.radius} km</label>
            <input className="w-full accent-brand-600" type="range" min="2" max="50" step="1" value={form.radius} onChange={(e) => setForm({ ...form, radius: Number(e.target.value) })} />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={searching || loading}>
            {searching ? 'Searching nearby workers…' : 'Find suitable workers'}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {workers.length === 0 ? (
          <div className="card p-5 text-sm text-stone-500">Search for workers to see nearby matches.</div>
        ) : (
          workers.map((worker) => (
            <div key={worker._id} className="card p-5">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                  {worker.profileImage ? (
                    <img src={worker.profileImage.startsWith('http') ? worker.profileImage : `${worker.profileImage}`} alt={worker.userId?.name || 'Worker'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-stone-600 dark:text-stone-200">
                      {(worker.userId?.name || 'W').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">{worker.userId?.name || 'Worker'}</h3>
                      <div className="mt-1">{worker.ratingCount ? <StarDisplay rating={worker.rating} /> : <span className="text-sm text-stone-500">New Worker – No Reviews Yet</span>}</div>
                    </div>
                    <span className={`badge ${worker.availability === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {worker.availability === 'available' ? 'Available' : 'Busy'}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-stone-100 px-2 py-1 dark:bg-stone-800">Skills: {worker.skills?.join(', ') || 'N/A'}</span>
                    <span className="rounded-full bg-stone-100 px-2 py-1 dark:bg-stone-800">Experience: {worker.experience || 0} years</span>
                    <span className="rounded-full bg-stone-100 px-2 py-1 dark:bg-stone-800">{worker.distanceKm !== null ? `${worker.distanceKm} km away` : 'Location based match'}</span>
                    <span className="rounded-full bg-stone-100 px-2 py-1 dark:bg-stone-800">{worker.location?.city || 'Location not set'}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-stone-500">{worker.ratingCount ? `${worker.ratingCount} review${worker.ratingCount > 1 ? 's' : ''}` : 'No reviews yet'}</p>
                    <button type="button" className="btn-primary text-xs" onClick={() => setSelectedWorker(worker)}>
                      Select Worker
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Confirm worker selection</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Worker:</span> {selectedWorker.userId?.name}</p>
              <p><span className="font-medium">Service:</span> {form.category}</p>
              <p><span className="font-medium">Location:</span> {form.address || form.city || 'Service location'}</p>
              <p><span className="font-medium">Date:</span> {form.preferredDate} at {form.preferredTime}</p>
              <p><span className="font-medium">Rating:</span> {selectedWorker.ratingCount ? `${selectedWorker.rating.toFixed(1)} / 5` : 'New worker - no reviews yet'}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setSelectedWorker(null)}>Cancel</button>
              <button type="button" className="btn-primary flex-1" onClick={confirmSelection} disabled={loading}>
                {loading ? 'Creating request…' : 'Confirm & assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
