import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import api from '../../api/axios';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#2f8069', '#4b9f86', '#78bda6', '#e8a13f', '#d68a24', '#a9d6c6', '#12312a', '#b56f18'];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => { setStats(data.stats); setCharts(data.charts); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-stone-500">Loading…</p>;

  const monthlyData = (charts?.monthlyRequests || []).map((m) => ({
    month: `${monthNames[m._id.month - 1]} '${String(m._id.year).slice(2)}`,
    requests: m.count,
  }));

  const categoryData = (charts?.categoryWise || []).map((c) => ({ name: c._id, value: c.count }));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Monthly requests</h3>
          {monthlyData.length === 0 ? (
            <p className="text-sm text-stone-500">Not enough data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="requests" fill="#2f8069" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Category-wise jobs</h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-stone-500">Not enough data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-4">Revenue</h3>
        <p className="text-3xl font-semibold">₹{(stats?.revenue || 0).toLocaleString('en-IN')}</p>
        <p className="text-sm text-stone-500 mt-1">Total collected across all paid, completed requests.</p>
      </div>
    </div>
  );
}
