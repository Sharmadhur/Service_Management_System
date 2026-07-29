import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/worker/assignedJobs').then(({ data }) => setJobs(data.jobs)).finally(() => setLoading(false));
  }, []);

  const pending = jobs.filter((j) => j.status === 'assigned');
  const active = jobs.filter((j) => ['accepted', 'on_the_way', 'in_progress'].includes(j.status));
  const completed = jobs.filter((j) => j.status === 'completed');

  const stats = [
    ['Awaiting response', pending.length],
    ['Active jobs', active.length],
    ['Completed jobs', completed.length],
  ];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-4">Recent job activity</h2>
        {loading ? (
          <p className="text-sm text-stone-500">Loading…</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-stone-500">No jobs assigned yet. Make sure your availability is set to "Available".</p>
        ) : (
          <div className="divide-y divide-stone-200 dark:divide-stone-800">
            {jobs.slice(0, 6).map((j) => (
              <div key={j._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{j.category} — {j.customerId?.name}</p>
                  <p className="text-xs text-stone-500">{new Date(j.preferredDate).toLocaleDateString()} · {j.preferredTime}</p>
                </div>
                <StatusBadge status={j.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
