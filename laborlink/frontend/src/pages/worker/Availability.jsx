import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function Availability() {
  const [availability, setAvailability] = useState('available');
  const [saving, setSaving] = useState(false);

  const update = async (value) => {
    setSaving(true);
    try {
      await api.put('/worker/availability', { availability: value });
      setAvailability(value);
      toast.success(`Status set to ${value}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md">
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-1">Availability</h2>
        <p className="text-sm text-stone-500 mb-6">Toggle whether you can currently be assigned new jobs.</p>
        <div className="grid grid-cols-2 gap-3">
          {['available', 'busy'].map((v) => (
            <button
              key={v} disabled={saving} onClick={() => update(v)}
              className={`rounded-lg border px-4 py-4 text-sm font-semibold capitalize transition ${
                availability === v
                  ? v === 'available'
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-amber-500 bg-amber-500 text-white'
                  : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
