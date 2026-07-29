import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const nextStatusMap = {
  accepted: { next: 'on_the_way', label: 'Start heading over' },
  on_the_way: { next: 'in_progress', label: 'Start job' },
  in_progress: { next: 'completed', label: 'Mark completed' },
};

export default function AssignedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/worker/assignedJobs').then(({ data }) => setJobs(data.jobs)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const accept = async (id) => {
    try {
      await api.put(`/worker/acceptJob/${id}`);
      toast.success('Job accepted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept job');
    }
  };

  const reject = async (id) => {
    if (!confirm('Reject this job? It will be reassigned to another worker.')) return;
    try {
      await api.put(`/worker/rejectJob/${id}`);
      toast.success('Job rejected');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject job');
    }
  };

  const advance = async (id, status) => {
    try {
      await api.put(`/worker/updateStatus/${id}`, { status });
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Assigned jobs</h2>
      {loading ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-stone-500">No jobs assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => {
            const transition = nextStatusMap[j.status];
            return (
              <div key={j._id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{j.category}</p>
                    <p className="text-sm text-stone-500">{j.description}</p>
                    <p className="text-xs text-stone-400 mt-1">{j.address}</p>
                    <p className="text-xs text-stone-400">
                      {new Date(j.preferredDate).toLocaleDateString()} · {j.preferredTime}
                    </p>
                    {j.customerId && (
                      <p className="text-xs text-stone-500 mt-1">Customer: {j.customerId.name} ({j.customerId.phone})</p>
                    )}
                  </div>
                  <StatusBadge status={j.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {j.status === 'assigned' && (
                    <>
                      <button className="btn-primary text-xs" onClick={() => accept(j._id)}>Accept</button>
                      <button className="btn-secondary text-xs" onClick={() => reject(j._id)}>Reject</button>
                    </>
                  )}
                  {transition && (
                    <button className="btn-primary text-xs" onClick={() => advance(j._id, transition.next)}>
                      {transition.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
