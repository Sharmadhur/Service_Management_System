import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const skillOptions = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Technician', 'Mechanic',
  'Cleaner', 'Gardener', 'Construction Labor', 'Moving Labor', 'House Helper', 'Other',
];

export default function Profile() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({ experience: '', serviceArea: '', hourlyRate: '', city: '' });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [ratingSummary, setRatingSummary] = useState({ rating: 0, reviewCount: 0, reviews: [] });

  useEffect(() => {
    api.get('/worker/reviews')
      .then(({ data }) => setRatingSummary({ rating: data.rating || 0, reviewCount: data.reviews?.length || 0, reviews: data.reviews || [] }))
      .catch((err) => toast.error(err.response?.data?.message || 'Could not load worker reviews'));
  }, []);

  const toggleSkill = (s) => setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      skills.forEach((s) => fd.append('skills', s));
      Object.entries(form).forEach(([k, v]) => v !== '' && fd.append(k, v));
      if (imageFile) fd.append('profileImage', imageFile);
      await api.put('/worker/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Worker profile</h2>
          <div className="text-right">
            <p className="text-sm text-stone-500">Average rating</p>
            <p className="text-xl font-semibold">{ratingSummary.reviewCount ? `${Number(ratingSummary.rating).toFixed(1)} / 5` : 'New Worker'}</p>
            {ratingSummary.reviewCount ? <p className="text-xs text-stone-500">Based on {ratingSummary.reviewCount} review(s)</p> : <p className="text-xs text-stone-500">No reviews yet</p>}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Profile picture</label>
            <input className="input-field" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Skills</label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((s) => (
                <button key={s} type="button" onClick={() => toggleSkill(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                    skills.includes(s) ? 'bg-brand-600 border-brand-600 text-white' : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" type="number" placeholder="Experience (years)"
              value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
            <input className="input-field" type="number" placeholder="Hourly rate (₹)"
              value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
          </div>
          <input className="input-field" placeholder="Service area / city"
            value={form.serviceArea} onChange={(e) => setForm({ ...form, serviceArea: e.target.value, city: e.target.value })} />
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Customer reviews</h3>
        {ratingSummary.reviews.length === 0 ? (
          <p className="text-sm text-stone-500">No reviews yet. This worker is still waiting for their first customer rating.</p>
        ) : (
          <div className="space-y-3">
            {ratingSummary.reviews.map((review) => (
              <div key={review._id} className="rounded-lg border border-stone-200 p-3 dark:border-stone-700">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{review.customerId?.name || 'Customer'}</p>
                  <span className="text-amber-500">{Array.from({ length: 5 }).map((_, idx) => (idx < review.rating ? '★' : '☆')).join('')}</span>
                </div>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{review.review || 'No written comment provided.'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
