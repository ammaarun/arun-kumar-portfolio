import React, { useState } from 'react';
import { Plus, Trash2, Edit3, ExternalLink, Terminal, CheckCircle2, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';

export const ProjectsView = () => {
  const { data, refreshData } = useData();
  const projects = data.projects || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: 'Backend & Microservices',
    description: '',
    longDescription: '',
    techInput: '',
    github: '',
    live: '',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    featured: true
  });

  const [saving, setSaving] = useState(false);

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      category: 'Backend & Microservices',
      description: '',
      longDescription: '',
      techInput: '',
      github: 'https://github.com',
      live: 'https://example.com',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      featured: true
    });
    setModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingId(proj.id);
    setFormData({
      ...proj,
      techInput: proj.tech ? proj.tech.join(', ') : ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const techArray = formData.techInput ? formData.techInput.split(',').map(s => s.trim()).filter(Boolean) : [];
    const payload = { ...formData, tech: techArray };
    delete payload.techInput;

    try {
      if (editingId) {
        await api.updateProject(editingId, payload);
      } else {
        await api.addProject(payload);
      }
      await refreshData();
      setModalOpen(false);
    } catch (err) {
      alert('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      await refreshData();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Project Management CMS</h2>
          <p className="text-xs text-slate-400">Add, edit, or remove featured microservices and full-stack projects.</p>
        </div>
        <button
          onClick={openNewModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 font-semibold">
                  {proj.category}
                </span>
                <div className="flex items-center space-x-1">
                  <button onClick={() => openEditModal(proj)} className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(proj.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white">{proj.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{proj.description}</p>

              <div className="flex flex-wrap gap-1">
                {proj.tech?.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-[10px] bg-[#0a0d14] text-slate-300 rounded font-mono border border-slate-800">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#121723] rounded-2xl border border-slate-800 p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Backend & Microservices">Backend & Microservices</option>
                    <option value="Full Stack">Full Stack</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Short Card Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Technologies (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Java 17, Spring Boot, Kafka, React, Redis"
                  value={formData.techInput}
                  onChange={(e) => setFormData({ ...formData, techInput: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Live Demo URL</label>
                  <input
                    type="url"
                    value={formData.live}
                    onChange={(e) => setFormData({ ...formData, live: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white">
                  {saving ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
