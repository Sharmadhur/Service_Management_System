import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/customer/profile', form);
      const updated = { ...user, name: data.user.name };
      localStorage.setItem('laborlink_user', JSON.stringify(updated));
      setUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-6">Your profile</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Full name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input className="input-field bg-stone-100 dark:bg-stone-800" value={user?.email || ''} disabled />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Phone</label>
            <input className="input-field" placeholder="Update phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Default address</label>
            <textarea className="input-field" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      </div>
    </div>
  );
}
