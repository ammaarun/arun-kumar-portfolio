import React, { useState } from 'react';
import { Plus, Trash2, Briefcase } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';

export const ExperienceView = () => {
  const { data, refreshData } = useData();
  const experience = data.experience || [];

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [period, setPeriod] = useState('2024 - Present');
  const [location, setLocation] = useState('Telangana, India');
  const [achievementsInput, setAchievementsInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!company || !role) return;
    setSaving(true);
    const achievements = achievementsInput.split('\n').map(s => s.trim()).filter(Boolean);
    try {
      await api.addExperience({ company, role, period, location, achievements, type: 'Full-time' });
      setCompany('');
      setRole('');
      setAchievementsInput('');
      await refreshData();
    } catch (err) {
      alert('Failed to add experience');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience entry?')) return;
    try {
      await api.deleteExperience(id);
      await refreshData();
    } catch (err) {
      alert('Failed to delete experience');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Experience & Career History</h2>
        <p className="text-xs text-slate-400">Manage work experience roles and achievement bullet points.</p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add New Work Role</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Company Name *</label>
            <input
              type="text"
              required
              placeholder="Enterprise Tech"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Role Title *</label>
            <input
              type="text"
              required
              placeholder="Senior Java Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Time Period</label>
            <input
              type="text"
              placeholder="2023 - Present"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Location</label>
            <input
              type="text"
              placeholder="Telangana, India"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300">Achievements (one bullet point per line)</label>
          <textarea
            rows={3}
            placeholder="Architected 8+ Spring Boot microservices handling over 2M daily requests.&#10;Reduced SQL query execution times by 45%."
            value={achievementsInput}
            onChange={(e) => setAchievementsInput(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{saving ? 'Adding...' : 'Add Work Role'}</span>
        </button>
      </form>

      {/* List */}
      <div className="space-y-4">
        {experience.map((exp, idx) => (
          <div key={exp.id || idx} className="p-5 rounded-2xl bg-[#121723] border border-slate-800 flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base">{exp.role}</span>
                <span className="text-xs text-emerald-400 font-mono">• {exp.company}</span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{exp.period} | {exp.location}</p>
            </div>
            <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
