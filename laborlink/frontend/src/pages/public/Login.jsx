import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const dashboardPath = { customer: '/customer', worker: '/worker', admin: '/admin' };

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(dashboardPath[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-md px-5 py-16">
        <h1 className="text-3xl font-semibold mb-2">Log in</h1>
        <p className="text-stone-500 mb-8">Welcome back to LaborLink.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input
              className="input-field" type="email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <input
              className="input-field" type="password" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </button>
        </form>
        <p className="mt-6 text-sm text-stone-500">
          Don't have an account? <Link to="/register" className="text-brand-600 font-medium">Register</Link>
        </p>
        <div className="mt-8 card p-4 text-xs text-stone-500">
          <p className="font-semibold mb-1">Demo logins (after running the seed script)</p>
          <p>Admin: admin@laborlink.com / admin123</p>
          <p>Customer: customer@laborlink.com / password123</p>
          <p>Worker: worker1@laborlink.com / password123</p>
        </div>
      </div>
    </div>
  );
}
