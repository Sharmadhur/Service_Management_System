import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const categories = [
  ['Electrician', 'Wiring, fixtures, panel work, repairs.'],
  ['Plumber', 'Leaks, fittings, installations, drainage.'],
  ['Carpenter', 'Furniture, fittings, repairs, custom work.'],
  ['Painter', 'Interior, exterior, touch-ups, texture work.'],
  ['AC Technician', 'Installation, servicing, gas refill, repairs.'],
  ['Mechanic', 'Two-wheeler and vehicle repair at your location.'],
  ['Cleaner', 'Deep cleaning, move-in/move-out, regular upkeep.'],
  ['Gardener', 'Lawn care, pruning, planting, upkeep.'],
  ['Construction Labor', 'General site labor, loading, masonry support.'],
  ['Moving Labor', 'Packing, loading, moving, unloading.'],
  ['House Helper', 'Daily household assistance and chores.'],
  ['Other', 'Something else? Describe the job and we\u2019ll match you.'],
];

export default function Services() {
  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="text-3xl font-semibold mb-2">Services</h1>
        <p className="text-stone-500 mb-10">Twelve trades, one request form.</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(([name, desc]) => (
            <div key={name} className="card p-5">
              <h3 className="font-semibold">{name}</h3>
              <p className="mt-1 text-sm text-stone-500">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/register" className="btn-primary text-base px-6 py-3">Request a worker now</Link>
        </div>
      </div>
    </div>
  );
}
