import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customer/myPayments').then(({ data }) => setPayments(data.payments)).finally(() => setLoading(false));
  }, []);

  const totalSpent = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

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
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Transaction ID</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {loading ? (
              <tr><td className="px-4 py-4 text-stone-500" colSpan={5}>Loading…</td></tr>
            ) : payments.length === 0 ? (
              <tr><td className="px-4 py-4 text-stone-500" colSpan={5}>No payment history yet.</td></tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="px-4 py-3">{payment.requestId?.category || 'Service'}</td>
                  <td className="px-4 py-3">{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{payment.razorpayPaymentId || payment.transactionRef || 'N/A'}</td>
                  <td className="px-4 py-3">₹{(payment.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><StatusBadge status={payment.paymentStatus === 'successful' ? 'paid' : payment.paymentStatus || 'pending'} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
