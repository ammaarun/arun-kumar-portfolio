import React, { useState } from 'react';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';

export const TestimonialsView = () => {
  const { data, refreshData } = useData();
  const testimonials = data.testimonials || [];

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !content) return;
    setSaving(true);
    try {
      await api.addTestimonial({ name, role, company, content, visible: true });
      setName('');
      setRole('');
      setCompany('');
      setContent('');
      await refreshData();
    } catch (err) {
      alert('Failed to add testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete testimonial?')) return;
    try {
      await api.deleteTestimonial(id);
      await refreshData();
    } catch (err) {
      alert('Failed to delete testimonial');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Testimonials & Reviews</h2>
        <p className="text-xs text-slate-400">Manage client endorsements, colleague reviews, and recommendations.</p>
      </div>

      <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add New Recommendation</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Reviewer Name *</label>
            <input
              type="text"
              required
              placeholder="Suresh Reddy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Role Title</label>
            <input
              type="text"
              placeholder="Engineering Director"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Company Name</label>
            <input
              type="text"
              placeholder="Enterprise Tech"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300">Testimonial Review Text *</label>
          <textarea
            rows={3}
            required
            placeholder="Arun is an exceptional Java developer. His expertise in Spring Boot microservices..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{saving ? 'Adding...' : 'Add Testimonial'}</span>
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((t) => (
          <div key={t.id} className="p-5 rounded-2xl bg-[#121723] border border-slate-800 flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">{t.name}</span>
                <span className="text-xs text-emerald-400 font-mono">• {t.role} ({t.company})</span>
              </div>
              <p className="text-xs text-slate-400 italic">"{t.content}"</p>
            </div>
            <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
