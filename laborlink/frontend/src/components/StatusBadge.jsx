const STYLES = {
  requested: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  assigned: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  accepted: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  on_the_way: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  in_progress: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400 line-through',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  successful: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  busy: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const LABELS = {
  on_the_way: 'On the way',
  in_progress: 'In progress',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.requested;
  const label = LABELS[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '');
  return <span className={`badge ${style}`}>{label}</span>;
}
