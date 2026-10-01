import React, { useState } from 'react';
import { 
  Plus, Eye, EyeOff, ArrowUp, ArrowDown, Trash2, Edit3, Save, CheckCircle2, 
  Layers, Layout, Sparkles, Award, BookOpen, FileText, Globe, Heart, ShieldCheck, HelpCircle, DollarSign
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';

const BUILTIN_PRESETS = [
  { id: 'services', name: 'Services', icon: 'Sparkles', layout: 'cards', title: 'Services & Offerings', subtitle: 'Specialized solutions provided to clients' },
  { id: 'awards', name: 'Awards & Honors', icon: 'Award', layout: 'cards', title: 'Awards & Recognition', subtitle: 'Honors, accolades, and achievements' },
  { id: 'publications', name: 'Publications & Articles', icon: 'BookOpen', layout: 'list', title: 'Publications & Research', subtitle: 'Published papers, articles, and books' },
  { id: 'courses', name: 'Courses & Curriculum', icon: 'FileText', layout: 'list', title: 'Courses & Workshops', subtitle: 'Academic and professional training programs' },
  { id: 'languages', name: 'Languages & Skills', icon: 'Globe', layout: 'statistics', title: 'Languages & Proficiency', subtitle: 'Spoken and technical language fluency' },
  { id: 'volunteer', name: 'Volunteer Work', icon: 'Heart', layout: 'cards', title: 'Volunteer & Impact Work', subtitle: 'Community involvement and social initiatives' },
  { id: 'faq', name: 'FAQ / Frequently Asked', icon: 'HelpCircle', layout: 'faq', title: 'Frequently Asked Questions', subtitle: 'Common questions and detailed answers' },
  { id: 'pricing', name: 'Pricing Packages', icon: 'DollarSign', layout: 'cards', title: 'Pricing & Service Packages', subtitle: 'Transparent pricing tiers and service packages' }
];

export const SectionBuilderView = () => {
  const { data, refreshData } = useData();
  const designConfig = data.designConfig || {};
  const sections = Array.isArray(designConfig.sections) ? designConfig.sections : [];

  const [localSections, setLocalSections] = useState(sections);
  const [editingSection, setEditingSection] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Add section form
  const [newSectionType, setNewSectionType] = useState('custom');
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionSubtitle, setNewSectionSubtitle] = useState('');
  const [newSectionLayout, setNewSectionLayout] = useState('cards');
  const [newSectionIcon, setNewSectionIcon] = useState('Sparkles');

  const saveSections = async (updated) => {
    setSaving(true);
    try {
      const res = await api.updateDesignConfig({
        ...designConfig,
        sections: updated
      });
      if (res.success) {
        setSuccessMsg('Section architecture updated successfully!');
        await refreshData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to update sections');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = (id) => {
    const updated = localSections.map(sec => 
      sec.id === id ? { ...sec, visible: sec.visible === false ? true : false } : sec
    );
    setLocalSections(updated);
    saveSections(updated);
  };

  const handleMove = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localSections.length) return;
    const reordered = [...localSections];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const normalized = reordered.map((s, i) => ({ ...s, order: i + 1 }));
    setLocalSections(normalized);
    saveSections(normalized);
  };

  const handleDeleteSection = (id) => {
    if (!window.confirm('Are you sure you want to delete this custom section? Existing content items will be removed.')) return;
    const updated = localSections.filter(sec => sec.id !== id);
    setLocalSections(updated);
    saveSections(updated);
  };

  const handleAddSectionSubmit = (e) => {
    e.preventDefault();
    let secObj;
    if (newSectionType === 'preset') {
      const preset = BUILTIN_PRESETS.find(p => p.id === newSectionName);
      if (!preset) return;
      secObj = {
        id: `sec-${preset.id}-${Date.now()}`,
        type: 'custom',
        name: preset.name,
        title: preset.title,
        subtitle: preset.subtitle,
        layout: preset.layout,
        icon: preset.icon,
        visible: true,
        order: localSections.length + 1,
        content: []
      };
    } else {
      if (!newSectionName) return;
      const customId = `custom-${newSectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
      secObj = {
        id: customId,
        type: 'custom',
        name: newSectionName,
        title: newSectionTitle || newSectionName,
        subtitle: newSectionSubtitle || '',
        layout: newSectionLayout,
        icon: newSectionIcon,
        visible: true,
        order: localSections.length + 1,
        content: []
      };
    }

    const updated = [...localSections, secObj];
    setLocalSections(updated);
    saveSections(updated);
    setIsAddModalOpen(false);
    setNewSectionName('');
    setNewSectionTitle('');
    setNewSectionSubtitle('');
  };

  const handleSaveEditingSection = () => {
    if (!editingSection) return;
    const updated = localSections.map(sec => 
      sec.id === editingSection.id ? editingSection : sec
    );
    setLocalSections(updated);
    saveSections(updated);
    setEditingSection(null);
  };

  const handleAddItemToEditingSection = () => {
    if (!editingSection) return;
    const newItem = {
      id: `item-${Date.now()}`,
      title: 'New Content Item',
      subtitle: '',
      description: 'Add detailed description here.',
      badge: '',
      tags: [],
      link: '',
      linkText: ''
    };
    setEditingSection({
      ...editingSection,
      content: [...(editingSection.content || []), newItem]
    });
  };

  const handleUpdateEditingItem = (itemIdx, field, val) => {
    if (!editingSection) return;
    const updatedContent = [...(editingSection.content || [])];
    updatedContent[itemIdx] = { ...updatedContent[itemIdx], [field]: val };
    setEditingSection({ ...editingSection, content: updatedContent });
  };

  const handleDeleteEditingItem = (itemIdx) => {
    if (!editingSection) return;
    const updatedContent = (editingSection.content || []).filter((_, idx) => idx !== itemIdx);
    setEditingSection({ ...editingSection, content: updatedContent });
  };

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Section Builder & Ordering</span>
          </h2>
          <p className="text-xs text-slate-400">Enable, disable, reorder, add custom sections, and edit data-driven section blocks for any portfolio profession.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sections List */}
      <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-3">
        {localSections.map((sec, idx) => (
          <div 
            key={sec.id}
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              sec.visible !== false ? 'bg-[#0a0d14] border-slate-800' : 'bg-slate-900/40 border-slate-800/60 opacity-60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center font-bold">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>{sec.name || sec.title || sec.id}</span>
                  {sec.type === 'custom' && (
                    <span className="px-2 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-300 rounded font-mono">Custom</span>
                  )}
                </h4>
                <p className="text-xs text-slate-400">{sec.subtitle || (sec.visible !== false ? 'Section Visible' : 'Hidden from Navigation & Portfolio')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {sec.type === 'custom' && (
                <button
                  onClick={() => setEditingSection(sec)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-xs flex items-center space-x-1"
                  title="Edit Custom Section Content"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold">Edit Content</span>
                </button>
              )}

              <button
                onClick={() => handleToggleVisibility(sec.id)}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                  sec.visible !== false
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
                title={sec.visible !== false ? 'Hide Section' : 'Show Section'}
              >
                {sec.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleMove(idx, 'up')}
                disabled={idx === 0}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 disabled:opacity-30 border border-slate-800"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleMove(idx, 'down')}
                disabled={idx === localSections.length - 1}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 disabled:opacity-30 border border-slate-800"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              {sec.type === 'custom' && (
                <button
                  onClick={() => handleDeleteSection(sec.id)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800"
                  title="Delete Custom Section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Section Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#121723] border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Add New Section to Portfolio</span>
            </h3>

            <form onSubmit={handleAddSectionSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Section Source Type</label>
                <select
                  value={newSectionType}
                  onChange={(e) => setNewSectionType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="preset">Choose from Pre-Built Section Presets</option>
                  <option value="custom">Create Custom Data-Driven Section</option>
                </select>
              </div>

              {newSectionType === 'preset' ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Select Section Preset</label>
                  <select
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Choose Preset Section --</option>
                    {BUILTIN_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Section Name / Admin Identifier</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Certifications & Licenses"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Public Section Heading</label>
                      <input
                        type="text"
                        placeholder="e.g. Accredited Certifications"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Layout Format</label>
                      <select
                        value={newSectionLayout}
                        onChange={(e) => setNewSectionLayout(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="cards">Cards Grid</option>
                        <option value="list">Detailed List</option>
                        <option value="faq">FAQ Accordion</option>
                        <option value="statistics">Statistics Counter</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Section Subtitle / Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Verified industry credentials and professional licenses."
                      value={newSectionSubtitle}
                      onChange={(e) => setNewSectionSubtitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Section Content Editor Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl bg-[#121723] border border-slate-800 rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Custom Section: {editingSection.name}</h3>
                <p className="text-xs text-slate-400">Configure content blocks, layout, and display items.</p>
              </div>
              <button
                onClick={handleSaveEditingSection}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Public Section Heading</label>
                <input
                  type="text"
                  value={editingSection.title || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Layout Style</label>
                <select
                  value={editingSection.layout || 'cards'}
                  onChange={(e) => setEditingSection({ ...editingSection, layout: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="cards">Cards Grid</option>
                  <option value="list">Detailed List</option>
                  <option value="faq">FAQ Accordion</option>
                  <option value="statistics">Statistics Counter</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Subtitle / Tagline</label>
              <input
                type="text"
                value={editingSection.subtitle || ''}
                onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Items Manager */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-white">Content Items ({editingSection.content?.length || 0})</h4>
                <button
                  onClick={handleAddItemToEditingSection}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-semibold border border-slate-800 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              {(editingSection.content || []).map((item, itemIdx) => (
                <div key={item.id || itemIdx} className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-400 font-mono">Item #{itemIdx + 1}</span>
                    <button
                      onClick={() => handleDeleteEditingItem(itemIdx)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Title / Heading"
                      value={item.title || ''}
                      onChange={(e) => handleUpdateEditingItem(itemIdx, 'title', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#121723] border border-slate-800 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle / Institution / Date"
                      value={item.subtitle || ''}
                      onChange={(e) => handleUpdateEditingItem(itemIdx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#121723] border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Description / Details"
                    value={item.description || ''}
                    onChange={(e) => handleUpdateEditingItem(itemIdx, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#121723] border border-slate-800 text-xs text-white resize-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="url"
                      placeholder="External Link URL"
                      value={item.link || ''}
                      onChange={(e) => handleUpdateEditingItem(itemIdx, 'link', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#121723] border border-slate-800 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Link Button Text (e.g. Verify Credential)"
                      value={item.linkText || ''}
                      onChange={(e) => handleUpdateEditingItem(itemIdx, 'linkText', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#121723] border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleSaveEditingSection}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Save Section Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
