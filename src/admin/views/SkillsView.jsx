import React, { useState } from 'react';
import { Plus, Trash2, Code2, Check, Star } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';

export const SkillsView = () => {
  const { data, refreshData } = useData();
  const skills = data.skills || [];

  const [category, setCategory] = useState('Backend Engineering');
  const [name, setName] = useState('');
  const [level, setLevel] = useState(85);
  const [popular, setPopular] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await api.addSkill({ category, name, level, popular });
      if (res.success) {
        setName('');
        await refreshData();
      }
    } catch (err) {
      alert('Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (catName, skillName) => {
    if (!window.confirm(`Delete skill "${skillName}"?`)) return;
    try {
      const res = await api.deleteSkill(catName, skillName);
      if (res.success) {
        await refreshData();
      }
    } catch (err) {
      alert('Failed to delete skill');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Skills & Stack Management</h2>
        <p className="text-xs text-slate-400">Add, edit, or remove technical skills across backend, frontend, database, and DevOps categories.</p>
      </div>

      {/* Add Skill Form */}
      <form onSubmit={handleAddSkill} className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add New Technical Skill</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Backend Engineering">Backend Engineering</option>
              <option value="Frontend Development">Frontend Development</option>
              <option value="Databases & Caching">Databases & Caching</option>
              <option value="DevOps, Cloud & Tools">DevOps, Cloud & Tools</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Skill Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Spring Boot 3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Proficiency Level ({level}%)</label>
            <input
              type="range"
              min="50"
              max="100"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full accent-emerald-500 py-3"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="rounded bg-[#0a0d14] border-slate-800 text-emerald-500 focus:ring-emerald-500"
            />
            <span>Mark as Core/Featured Skill Badge</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{saving ? 'Adding...' : 'Add Skill'}</span>
          </button>
        </div>
      </form>

      {/* Skills Table List */}
      <div className="space-y-6">
        {skills.map((group, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider">
              {group.category} ({group.items?.length || 0})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {group.items?.map((item, sIdx) => (
                <div key={sIdx} className="p-3 rounded-xl bg-[#0a0d14] border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center space-x-1.5">
                      <span>{item.name}</span>
                      {item.popular && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">Proficiency: {item.level}%</div>
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(group.category, item.name)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
