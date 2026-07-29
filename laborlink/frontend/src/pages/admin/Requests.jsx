import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null);
  const [candidates, setCandidates] = useState([]);

  const load = () => {
    setLoading(true);
    api.get('/admin/requests', { params: { status: status || undefined } })
      .then(({ data }) => setRequests(data.requests))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const openAssign = async (req) => {
    setAssignModal(req);
    try {
      const { data } = await api.get('/admin/workers', { params: { verified: 'approved' } });
      setCandidates(data.workers.filter((w) => w.skills.includes(req.category)));
    } catch {
      setCandidates([]);
    }
  };

  const assign = async (workerId) => {
    try {
      await api.put(`/admin/assignWorker/${assignModal._id}`, { workerId });
      toast.success('Worker assigned');
      setAssignModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not assign worker');
    }
  };

  return (
    <div className="space-y-4">
      <select className="input-field max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option>
        {['requested', 'assigned', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'].map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        ))}
      </select>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 dark:bg-stone-800 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Worker</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {loading ? (
              <tr><td className="px-4 py-4 text-stone-500" colSpan={5}>Loading…</td></tr>
            ) : requests.length === 0 ? (
              <tr><td className="px-4 py-4 text-stone-500" colSpan={5}>No requests found.</td></tr>
            ) : (
              requests.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3">{r.customerId?.name}</td>
                  <td className="px-4 py-3">{r.workerId?.userId?.name || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <button className="btn-secondary text-xs" onClick={() => openAssign(r)}>
                      {r.workerId ? 'Reassign' : 'Assign'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-semibold mb-1">Assign worker</h3>
            <p className="text-sm text-stone-500 mb-4">Matching "{assignModal.category}" workers</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {candidates.length === 0 ? (
                <p className="text-sm text-stone-500">No approved workers with this skill.</p>
              ) : (
                candidates.map((w) => (
                  <button key={w._id} onClick={() => assign(w._id)}
                    className="w-full flex items-center justify-between rounded-lg border border-stone-200 dark:border-stone-800 px-3 py-2.5 text-sm hover:bg-stone-50 dark:hover:bg-stone-800">
                    <span>{w.userId?.name}</span>
                    <span className="text-xs text-stone-500">{w.availability} · {w.rating || 0}★</span>
                  </button>
                ))
              )}
            </div>
            <button className="btn-secondary w-full mt-4" onClick={() => setAssignModal(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
