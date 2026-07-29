import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/categories').then(({ data }) => setCategories(data.categories)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post('/admin/categories', { name: name.trim() });
      toast.success('Category added');
      setName('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add category');
    }
  };

  const toggleActive = async (cat) => {
    try {
      await api.put(`/admin/categories/${cat._id}`, { active: !cat.active });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update category');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete category');
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <form onSubmit={add} className="flex gap-2">
        <input className="input-field" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-primary shrink-0" type="submit">Add</button>
      </form>

      <div className="card divide-y divide-stone-200 dark:divide-stone-800">
        {loading ? (
          <p className="p-4 text-sm text-stone-500">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="p-4 text-sm text-stone-500">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <div key={c._id} className="flex items-center justify-between px-4 py-3">
              <span className={c.active ? '' : 'text-stone-400 line-through'}>{c.name}</span>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs" onClick={() => toggleActive(c)}>
                  {c.active ? 'Deactivate' : 'Activate'}
                </button>
                <button className="btn-secondary text-xs text-red-600" onClick={() => remove(c._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
