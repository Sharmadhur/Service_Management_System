import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/users', { params: { role: role || undefined, search: search || undefined } })
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [role]);

  const toggleBlock = async (id) => {
    try {
      await api.put(`/admin/blockUser/${id}`);
      toast.success('User status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update user');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/admin/user/${id}`);
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete user');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input className="input-field max-w-xs" placeholder="Search name or email"
          value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()} />
        <select className="input-field max-w-[160px]" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="worker">Worker</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn-secondary" onClick={load}>Search</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 dark:bg-stone-800 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {loading ? (
              <tr><td className="px-4 py-4 text-stone-500" colSpan={5}>Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td className="px-4 py-4 text-stone-500" colSpan={5}>No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button className="btn-secondary text-xs" onClick={() => toggleBlock(u._id)}>
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button className="btn-secondary text-xs text-red-600" onClick={() => remove(u._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
