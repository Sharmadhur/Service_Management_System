import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const categories = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Technician', 'Mechanic',
  'Cleaner', 'Gardener', 'Construction Labor', 'Moving Labor', 'House Helper', 'Other',
];

export default function RequestWorker() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: categories[0], description: '', address: '', city: '',
    preferredDate: '', preferredTime: '',
  });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/customer/request', form);
      toast.success(
        data.request.status === 'assigned'
          ? 'Request submitted — a worker has been assigned!'
          : 'Request submitted — searching for an available worker.'
      );
      navigate('/customer/requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-1">Request a worker</h2>
        <p className="text-sm text-stone-500 mb-6">We'll match you to the nearest available worker in this trade.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Job description</label>
            <textarea className="input-field" rows={4} required
              placeholder="Describe what you need done"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Address</label>
            <input className="input-field" required
              value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">City</label>
            <input className="input-field" placeholder="e.g. Chennai"
              value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Preferred date</label>
              <input className="input-field" type="date" required
                value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Preferred time</label>
              <input className="input-field" type="time" required
                value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      </div>
    </div>
  );
}
