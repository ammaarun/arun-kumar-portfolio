import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Edit3, ExternalLink, Terminal, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';
import { MediaPickerModal } from '../components/MediaPickerModal';

export const ProjectsView = () => {
  const { data, refreshData } = useData();
  const projects = data.projects || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalError, setModalError] = useState('');

  // Field updater — always uses functional setState to avoid stale-closure overwrites.
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setSaving(false);
    setModalError('');
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
    setSaving(false);
    setModalError('');
    setFormData({
      ...proj,
      techInput: proj.tech ? proj.tech.join(', ') : ''
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSaving(false);
    setModalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return; // Prevent duplicate submissions

    setSaving(true);
    setModalError('');

    try {
      if (!formData.title || !formData.title.trim()) {
        throw new Error('Project title is required.');
      }
      if (!formData.description || !formData.description.trim()) {
        throw new Error('Short card description is required.');
      }

      const techArray = formData.techInput
        ? formData.techInput.split(',').map(s => s.trim()).filter(Boolean)
        : (Array.isArray(formData.tech) ? formData.tech : []);

      const payload = {
        ...formData,
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || '',
        description: formData.description.trim(),
        category: formData.category || 'Backend & Microservices',
        tech: techArray,
        image: formData.image || '',
        github: formData.github || '',
        live: formData.live || '',
        featured: formData.featured ?? true
      };
      delete payload.techInput;

      let res;
      if (editingId) {
        res = await api.updateProject(editingId, payload);
      } else {
        res = await api.addProject(payload);
      }

      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to save project. Please check details and try again.');
      }

      await refreshData();
      closeModal();
      setSuccessMessage(editingId ? 'Project updated successfully.' : 'Project added successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setModalError(err.message || 'Failed to save project. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await api.deleteProject(id);
      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to delete project.');
      }
      await refreshData();
      setSuccessMessage('Project deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete project.');
      setTimeout(() => setErrorMessage(''), 5000);
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
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-emerald-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between" role="status">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-400/60 hover:text-emerald-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between" role="alert">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-400/60 hover:text-rose-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
              <button onClick={closeModal} disabled={saving} className="text-slate-400 hover:text-white disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Error Alert */}
            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="project-title" className="text-xs text-slate-300">Project Title *</label>
                  <input
                    id="project-title"
                    type="text"
                    required
                    disabled={saving}
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="project-category" className="text-xs text-slate-300">Category *</label>
                  <select
                    id="project-category"
                    disabled={saving}
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  >
                    <option value="Backend & Microservices">Backend & Microservices</option>
                    <option value="Full Stack">Full Stack</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="project-subtitle" className="text-xs text-slate-300">Subtitle / Tagline</label>
                <input
                  id="project-subtitle"
                  type="text"
                  disabled={saving}
                  value={formData.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="project-description" className="text-xs text-slate-300">Short Card Description *</label>
                <textarea
                  id="project-description"
                  rows={2}
                  required
                  disabled={saving}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="project-tech" className="text-xs text-slate-300">Technologies (comma-separated)</label>
                <input
                  id="project-tech"
                  type="text"
                  disabled={saving}
                  placeholder="Java 17, Spring Boot, Kafka, React, Redis"
                  value={formData.techInput}
                  onChange={(e) => updateField('techInput', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="project-image" className="text-xs text-slate-300">Project Image Cover</label>
                <div className="flex items-center space-x-2">
                  <input
                    id="project-image"
                    type="text"
                    disabled={saving}
                    value={formData.image}
                    onChange={(e) => updateField('image', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-60"
                  />
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setMediaPickerOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white shrink-0 disabled:opacity-60"
                  >
                    Choose Image
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="project-github" className="text-xs text-slate-300">GitHub URL</label>
                  <input
                    id="project-github"
                    type="url"
                    disabled={saving}
                    value={formData.github}
                    onChange={(e) => updateField('github', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="project-live" className="text-xs text-slate-300">Live Demo URL</label>
                  <input
                    id="project-live"
                    type="url"
                    disabled={saving}
                    value={formData.live}
                    onChange={(e) => updateField('live', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-950/20"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelectMedia={(mediaRecord) => {
          const imageValue = mediaRecord.storageBackend === 'neon'
            ? `neon::${mediaRecord.id}`
            : (mediaRecord.url || '');
          setFormData(prev => ({ ...prev, image: imageValue }));
        }}
        currentUrl={formData.image}
      />
    </div>
  );
};
