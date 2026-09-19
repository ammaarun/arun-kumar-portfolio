import React, { useState } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';

export const ServicesView = () => {
  const { data, refreshData } = useData();
  const services = data.services || [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricing, setPricing] = useState('Custom / Project');
  const [icon, setIcon] = useState('Server');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    setSaving(true);
    try {
      await api.addService({ title, description, pricing, icon, featured: true });
      setTitle('');
      setDescription('');
      await refreshData();
    } catch (err) {
      alert('Failed to add service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete service item?')) return;
    try {
      await api.deleteService(id);
      await refreshData();
    } catch (err) {
      alert('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Freelancing Services Management</h2>
        <p className="text-xs text-slate-400">Add, edit, or remove services offered to clients and employers.</p>
      </div>

      <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add New Service Offering</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Service Title *</label>
            <input
              type="text"
              required
              placeholder="Java Backend Development"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Pricing Badge Text</label>
            <input
              type="text"
              placeholder="Hourly / Contract"
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Icon</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Server">Server (Backend)</option>
              <option value="Layout">Layout (Frontend)</option>
              <option value="Database">Database</option>
              <option value="Code2">Code2 (Integration)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300">Service Description *</label>
          <textarea
            rows={3}
            required
            placeholder="Architecting high-throughput REST APIs and Spring Boot microservices..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{saving ? 'Adding...' : 'Add Service'}</span>
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((srv) => (
          <div key={srv.id} className="p-5 rounded-2xl bg-[#121723] border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{srv.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400">
                  {srv.pricing}
                </span>
              </div>
              <p className="text-xs text-slate-400">{srv.description}</p>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button onClick={() => handleDelete(srv.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
