import { useState } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const submit = (e) => {
    e.preventDefault();
    toast.success('Message sent! Our team will get back to you shortly.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-lg px-5 py-16">
        <h1 className="text-3xl font-semibold mb-2">Contact us</h1>
        <p className="text-stone-500 mb-8">Questions about a job or your account? Send us a note.</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            className="input-field" placeholder="Your name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input-field" type="email" placeholder="Email address" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <textarea
            className="input-field" rows={5} placeholder="How can we help?" required
            value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <button type="submit" className="btn-primary w-full">Send message</button>
        </form>
      </div>
    </div>
  );
}
