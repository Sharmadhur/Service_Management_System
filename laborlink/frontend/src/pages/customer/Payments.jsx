import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function Payments() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customer/myRequests').then(({ data }) => setRequests(data.requests)).finally(() => setLoading(false));
  }, []);

  const paid = requests.filter((r) => r.paymentStatus === 'paid');
  const totalSpent = paid.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <p className="text-sm text-stone-500">Total spent</p>
        <p className="text-3xl font-semibold">₹{totalSpent.toLocaleString('en-IN')}</p>
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
            ) : requests.length === 0 ? (
              <tr><td className="px-4 py-4 text-stone-500" colSpan={4}>No payment history yet.</td></tr>
            ) : (
              requests.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3">{new Date(r.preferredDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">₹{(r.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.paymentStatus} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
