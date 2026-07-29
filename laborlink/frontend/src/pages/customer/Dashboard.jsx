import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customer/myRequests').then(({ data }) => setRequests(data.requests)).finally(() => setLoading(false));
  }, []);

  const active = requests.filter((r) => !['completed', 'cancelled'].includes(r.status));
  const completed = requests.filter((r) => r.status === 'completed');

  const stats = [
    ['Active requests', active.length],
    ['Completed jobs', completed.length],
    ['Total requests', requests.length],
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent requests</h2>
          <Link to="/customer/requests" className="text-sm text-brand-600 font-medium">View all</Link>
        </div>
        {loading ? (
          <p className="text-sm text-stone-500">Loading…</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-stone-500 mb-4">No requests yet.</p>
            <Link to="/customer/request" className="btn-primary">Request a worker</Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-200 dark:divide-stone-800">
            {requests.slice(0, 5).map((r) => (
              <div key={r._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.category}</p>
                  <p className="text-xs text-stone-500">{new Date(r.preferredDate).toLocaleDateString()} · {r.preferredTime}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
