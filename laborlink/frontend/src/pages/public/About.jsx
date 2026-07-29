import Navbar from '../../components/Navbar';

export default function About() {
  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-3xl font-semibold mb-4">About LaborLink</h1>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          LaborLink connects households and businesses with skilled and unskilled workers
          across twelve trades. Our matching engine considers a worker's skill, current
          availability, and proximity to assign the right person to every job — automatically,
          or with a manual override from our operations team when a job needs special handling.
        </p>
        <p className="mt-4 text-stone-600 dark:text-stone-400 leading-relaxed">
          Every worker on the platform is verified before they can accept jobs, and every
          completed job is rated, keeping quality visible and accountable on both sides.
        </p>
      </div>
    </div>
  );
}
