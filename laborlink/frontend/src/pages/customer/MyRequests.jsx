import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/customer/myRequests').then(({ data }) => setRequests(data.requests)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this request?')) return;
    try {
      await api.put(`/customer/cancelRequest/${id}`);
      toast.success('Request cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    }
  };

  const pay = async (request) => {
    try {
      const publicKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!publicKey) {
        toast.error('Razorpay public key is not configured. Add VITE_RAZORPAY_KEY_ID to your frontend .env file.');
        return;
      }

      const { data } = await api.post(`/customer/pay/${request._id}`);
      if (data.alreadyPaid) {
        toast.success('This request has already been paid.');
        load();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const checkout = new window.Razorpay({
          key: publicKey,
          amount: data.order.amount,
          currency: data.order.currency,
          order_id: data.order.id,
          name: 'LaborLink',
          description: `Payment for ${request.category}`,
          handler: async function (response) {
            try {
              await api.post('/customer/verifyPayment', {
                requestId: request._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success('Payment successful — your worker was credited.');
              load();
            } catch (verifyErr) {
              toast.error(verifyErr.response?.data?.message || 'Payment was created but verification failed.');
            }
          },
          prefill: {
            name: localStorage.getItem('laborlink_user') ? JSON.parse(localStorage.getItem('laborlink_user')).name : '',
          },
          theme: { color: '#2563eb' },
        });
        checkout.open();
      };
      script.onerror = () => toast.error('Razorpay checkout could not be loaded.');
      document.body.appendChild(script);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  const submitReview = async () => {
    try {
      await api.post('/customer/review', { requestId: reviewModal, rating, review: reviewText });
      toast.success('Review submitted — thank you!');
      setReviewModal(null);
      setRating(5);
      setReviewText('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">My requests</h2>
      {loading ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-stone-500">No requests yet.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{r.category}</p>
                  <p className="text-sm text-stone-500">{r.description}</p>
                  <p className="text-xs text-stone-400 mt-1">{r.address}</p>
                  <p className="text-xs text-stone-400">
                    {new Date(r.preferredDate).toLocaleDateString()} · {r.preferredTime}
                  </p>
                  {r.workerId?.userId && (
                    <p className="text-xs text-stone-500 mt-1">
                      Worker: {r.workerId.userId.name} ({r.workerId.userId.phone})
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={r.status} />
                  <StatusBadge status={r.paymentStatus === 'paid' ? 'paid' : r.paymentStatus || 'pending'} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {!['completed', 'cancelled'].includes(r.status) && (
                  <button className="btn-secondary text-xs" onClick={() => cancel(r._id)}>Cancel</button>
                )}
                {r.status === 'completed' && r.paymentStatus !== 'paid' && (
                  <button className="btn-primary text-xs" onClick={() => pay(r)}>Pay now</button>
                )}
                {r.status === 'completed' && r.paymentStatus === 'paid' && (
                  <button className="btn-secondary text-xs" onClick={() => setReviewModal(r._id)}>Rate & review</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-4">Rate this worker</h3>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? 'text-amber-500' : 'text-stone-300'}`}>★</button>
              ))}
            </div>
            <textarea className="input-field mb-4" rows={3} placeholder="Leave a review (optional)" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
            <div className="flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={submitReview}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
