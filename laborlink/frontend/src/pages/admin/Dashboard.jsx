import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => setStats(data.stats)).finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        ['Total customers', stats.totalCustomers],
        ['Total workers', stats.totalWorkers],
        ['Pending requests', stats.pendingRequests],
        ['Completed requests', stats.completedRequests],
        ['Revenue', `₹${stats.revenue.toLocaleString('en-IN')}`],
        ['Average rating', stats.averageRating || '—'],
        ['Active workers', stats.activeWorkers],
        ['Jobs today', stats.jobsToday],
      ]
    : [];

  return (
    <div className="space-y-6">
      {loading ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map(([label, value]) => (
            <div key={label} className="card p-5">
              <p className="text-sm text-stone-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-sm text-stone-500">
        See the <span className="font-medium">Analytics</span> tab for monthly trends and category breakdowns.
      </p>
    </div>
  );
}
