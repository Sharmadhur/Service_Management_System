import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import {
  HiOutlineLightningBolt, HiOutlineShieldCheck, HiOutlineClock, HiOutlineStar,
} from 'react-icons/hi';

const categories = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Technician', 'Mechanic',
  'Cleaner', 'Gardener', 'Construction Labor', 'Moving Labor', 'House Helper', 'Other',
];

export default function Home() {
  return (
    <div>
      <Navbar />

      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 mb-5">
              Now serving 12 trades, city-wide
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-stone-900 dark:text-stone-50">
              Skilled hands, dispatched to your door.
            </h1>
            <p className="mt-5 text-lg text-stone-600 dark:text-stone-400">
              LaborLink matches you with a verified worker, nearby, in the right trade —
              in minutes, not days. Track the job from request to receipt.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary text-base px-6 py-3">Request a worker</Link>
              <Link to="/services" className="btn-secondary text-base px-6 py-3">Browse trades</Link>
            </div>
            <div className="mt-10 flex gap-8 text-sm text-stone-500">
              <div><span className="block text-2xl font-semibold text-stone-900 dark:text-stone-100">4.7★</span>average rating</div>
              <div><span className="block text-2xl font-semibold text-stone-900 dark:text-stone-100">18min</span>avg. dispatch</div>
              <div><span className="block text-2xl font-semibold text-stone-900 dark:text-stone-100">12</span>service trades</div>
            </div>
          </div>

          <div className="card p-6 md:p-8">
            <h3 className="font-semibold mb-4">How a request moves</h3>
            <ol className="space-y-4">
              {[
                ['Requested', 'You describe the job and pick a time.'],
                ['Assigned', 'Nearest matching worker is notified.'],
                ['In progress', 'Track status live, from arrival to finish.'],
                ['Completed & paid', 'Pay, then rate the work.'],
              ].map(([step, desc], i) => (
                <li key={step} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-semibold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium">{step}</p>
                    <p className="text-sm text-stone-500">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-2xl font-semibold mb-8">Every trade, one call away</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((c) => (
              <div key={c} className="card px-4 py-3 text-sm font-medium text-stone-700 dark:text-stone-300">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            [HiOutlineLightningBolt, 'Fast dispatch', 'Nearest available worker, matched automatically.'],
            [HiOutlineShieldCheck, 'Verified workers', 'Every worker is approved before going live.'],
            [HiOutlineClock, 'Live status', 'Follow the job from accepted to completed.'],
            [HiOutlineStar, 'Rated & reviewed', 'Real ratings from past customers.'],
          ].map(([Icon, title, desc]) => (
            <div key={title} className="card p-5">
              <Icon className="text-brand-600 dark:text-brand-400" size={26} />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-stone-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-stone-200 dark:border-stone-800 py-8 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} LaborLink. Built for the on-demand workforce.
      </footer>
    </div>
  );
}
