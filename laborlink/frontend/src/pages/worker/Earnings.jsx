import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function Earnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/worker/earnings').then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm text-stone-500">Total earnings</p>
          <p className="text-3xl font-semibold">₹{(data?.totalEarnings || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-stone-500">Completed jobs</p>
          <p className="text-3xl font-semibold">{data?.completedJobs || 0}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 dark:bg-stone-800 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {loading ? (
              <tr><td className="px-4 py-4 text-stone-500" colSpan={4}>Loading…</td></tr>
            ) : !data?.transactions?.length ? (
              <tr><td className="px-4 py-4 text-stone-500" colSpan={4}>No paid jobs yet.</td></tr>
            ) : (
              data.transactions.map((t) => (
                <tr key={t._id}>
                  <td className="px-4 py-3">{t.category}</td>
                  <td className="px-4 py-3">{new Date(t.preferredDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">₹{(t.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.paymentStatus} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
