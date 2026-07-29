import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customer/myReviews').then(({ data }) => setReviews(data.reviews)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Your reviews</h2>
      {loading ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-stone-500">
          You haven't reviewed any workers yet. Reviews can be left from a completed, paid request in "My requests".
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.workerId?.userId?.name || 'Worker'}</p>
                <span className="text-accent-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              {r.review && <p className="mt-2 text-sm text-stone-500">{r.review}</p>}
              <p className="mt-2 text-xs text-stone-400">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
