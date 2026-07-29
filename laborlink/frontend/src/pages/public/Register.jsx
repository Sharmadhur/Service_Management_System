import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const skillOptions = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Technician', 'Mechanic',
  'Cleaner', 'Gardener', 'Construction Labor', 'Moving Labor', 'House Helper', 'Other',
];

const dashboardPath = { customer: '/customer', worker: '/worker', admin: '/admin' };

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', skills: [], experience: 0, serviceArea: '', hourlyRate: '',
  });

  const toggleSkill = (skill) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (role === 'worker' && form.skills.length === 0) {
      toast.error('Select at least one skill');
      return;
    }
    try {
      const user = await register({ ...form, role });
      toast.success(`Account created — welcome, ${user.name.split(' ')[0]}!`);
      navigate(dashboardPath[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-lg px-5 py-16">
        <h1 className="text-3xl font-semibold mb-2">Create an account</h1>
        <p className="text-stone-500 mb-8">Request workers, or start earning as one.</p>

        <div className="mb-6 grid grid-cols-2 gap-2">
          {['customer', 'worker'].map((r) => (
            <button
              key={r} type="button" onClick={() => setRole(r)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-semibold capitalize transition ${
                role === r
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300'
              }`}
            >
              I'm a {r}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input className="input-field" placeholder="Full name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-field" type="email" placeholder="Email address" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input-field" placeholder="Phone number" required
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input-field" type="password" placeholder="Password (min 6 characters)" required minLength={6}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

          {role === 'worker' && (
            <div className="space-y-4 rounded-lg border border-dashed border-stone-300 dark:border-stone-700 p-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Skills / trades</label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((s) => (
                    <button
                      key={s} type="button" onClick={() => toggleSkill(s)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                        form.skills.includes(s)
                          ? 'bg-brand-600 border-brand-600 text-white'
                          : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" type="number" min="0" placeholder="Experience (years)"
                  value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                <input className="input-field" type="number" min="0" placeholder="Hourly rate (₹)"
                  value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
              </div>
              <input className="input-field" placeholder="Service area / city"
                value={form.serviceArea} onChange={(e) => setForm({ ...form, serviceArea: e.target.value })} />
              <p className="text-xs text-stone-500">Your account will need admin approval before you can accept jobs.</p>
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-sm text-stone-500">
          Already have an account? <Link to="/login" className="text-brand-600 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
