import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [verified, setVerified] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/workers', { params: { verified: verified || undefined } })
      .then(({ data }) => setWorkers(data.workers))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [verified]);

  const decide = async (id, decision) => {
    try {
      await api.put(`/admin/approveWorker/${id}`, { decision });
      toast.success(`Worker ${decision}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update worker');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select className="input-field max-w-[180px]" value={verified} onChange={(e) => setVerified(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 dark:bg-stone-800 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Skills</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Availability</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {loading ? (
              <tr><td className="px-4 py-4 text-stone-500" colSpan={6}>Loading…</td></tr>
            ) : workers.length === 0 ? (
              <tr><td className="px-4 py-4 text-stone-500" colSpan={6}>No workers found.</td></tr>
            ) : (
              workers.map((w) => (
                <tr key={w._id}>
                  <td className="px-4 py-3">{w.userId?.name}</td>
                  <td className="px-4 py-3">{w.skills.join(', ')}</td>
                  <td className="px-4 py-3">{w.rating ? `${w.rating}★ (${w.ratingCount})` : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={w.availability} /></td>
                  <td className="px-4 py-3"><StatusBadge status={w.verified} /></td>
                  <td className="px-4 py-3 space-x-2">
                    {w.verified !== 'approved' && (
                      <button className="btn-secondary text-xs" onClick={() => decide(w._id, 'approved')}>Approve</button>
                    )}
                    {w.verified !== 'rejected' && (
                      <button className="btn-secondary text-xs text-red-600" onClick={() => decide(w._id, 'rejected')}>Reject</button>
                    )}
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
