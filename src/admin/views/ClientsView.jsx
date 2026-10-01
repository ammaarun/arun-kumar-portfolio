import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Edit3, Trash2, ExternalLink, CheckCircle2, 
  Sparkles, Layers, ArrowRight, ShieldCheck, X, Eye, Clock, AlertTriangle,
  Copy, Code, Database, Terminal, Layout, BookOpen, Briefcase, User, Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { MultiDevicePreviewModal } from '../components/MultiDevicePreviewModal';

export const ClientsView = ({ setActiveTab }) => {
  const { token } = useAuth();
  const { data, refetchData } = useData();

  const [clients, setClients] = useState([]);
  const [activeClientId, setActiveClientId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [previewClient, setPreviewClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [slug, setSlug] = useState('');
  const [presetId, setPresetId] = useState('fresher');

  const [presets, setPresets] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const filteredClients = clients.filter(client => {
    if (statusFilter !== 'ALL' && (client.status || 'DRAFT') !== statusFilter) {
      return false;
    }
    return true;
  });

  const fetchClients = async () => {
    try {
      const res = await fetch(`/api/admin/clients?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setClients(resData.data || []);
        setActiveClientId(resData.activeClientId || '');
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/admin/presets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setPresets(resData.data || []);
      }
    } catch (err) {
      console.error('Error fetching presets:', err);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchPresets();
  }, [token, search]);

  const handleSelectClient = async (clientId) => {
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/select`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setActiveClientId(clientId);
        await refetchData();
        setMessage(`Active context switched to ${resData.client.name}.`);
        setTimeout(() => {
          if (setActiveTab) setActiveTab('overview');
        }, 1200);
      }
    } catch (err) {
      console.error('Error selecting client context:', err);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and email are required.');
      return;
    }
    setSubmitting(true);
    setError('');

    const activeProfession = profession === 'Other' ? (customProfession || 'Professional') : profession;
    const selectedProfObj = professionsList.find(p => p.id === profession);
    const activePreset = selectedProfObj ? selectedProfObj.preset : presetId;

    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name, 
          email, 
          role: role || activeProfession,
          profession: activeProfession,
          profileImage, 
          slug, 
          presetId: activePreset,
          templateId
        })
      });
      const resData = await res.json();
      if (resData.success) {
        setAddModalOpen(false);
        resetForm();
        setCreateStep(1);
        fetchClients();
        setMessage(`Portfolio for ${name} (${activeProfession}) created successfully!`);
      } else {
        setError(resData.message || 'Failed to create portfolio.');
      }
    } catch (err) {
      console.error('Error creating portfolio:', err);
      setError('Network error creating portfolio.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClient = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, role, profileImage, slug })
      });
      const resData = await res.json();
      if (resData.success) {
        setEditModalOpen(false);
        resetForm();
        fetchClients();
        setMessage(`Client ${name} updated successfully!`);
      } else {
        setError(resData.message || 'Failed to update client.');
      }
    } catch (err) {
      console.error('Error updating client:', err);
      setError('Network error updating client.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicateClient = async (client) => {
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        fetchClients();
        await refetchData();
        setMessage(`Portfolio duplicated as '${resData.data.name}'.`);
      } else {
        setError(resData.message || 'Failed to duplicate portfolio.');
      }
    } catch (err) {
      console.error('Error duplicating portfolio:', err);
      setError('Network error duplicating portfolio.');
    }
  };

  const [createStep, setCreateStep] = useState(1);
  const [profession, setProfession] = useState('Data Analyst');
  const [customProfession, setCustomProfession] = useState('');
  const [templateId, setTemplateId] = useState('modern-dark');

  const professionsList = [
    { id: 'Software Developer', label: 'Software Developer', preset: 'fullstack', icon: Code },
    { id: 'Data Analyst', label: 'Data Analyst', preset: 'dataAnalyst', icon: Database },
    { id: 'Data Scientist', label: 'Data Scientist', preset: 'dataAnalyst', icon: Terminal },
    { id: 'UI/UX Designer', label: 'UI/UX Designer', preset: 'designer', icon: Layout },
    { id: 'Digital Marketer', label: 'Digital Marketer', preset: 'designer', icon: Sparkles },
    { id: 'Teacher', label: 'Teacher / Educator', preset: 'teacher', icon: BookOpen },
    { id: 'Consultant', label: 'Business Consultant', preset: 'consultant', icon: Briefcase },
    { id: 'Student', label: 'Student', preset: 'student', icon: User },
    { id: 'Freelancer', label: 'Freelancer', preset: 'freelancer', icon: Globe },
    { id: 'Other', label: 'Other / Custom', preset: 'fullstack', icon: Plus }
  ];

  const templatesList = [
    { id: 'modern-dark', name: 'Modern', tag: 'Clean & modern design' },
    { id: 'professional', name: 'Professional', tag: 'Corporate & professional' },
    { id: 'minimal-light', name: 'Minimal', tag: 'Simple & elegant' },
    { id: 'creative', name: 'Creative', tag: 'Bold & creative' },
    { id: 'developer', name: 'Developer', tag: 'Tech-focused style' },
    { id: 'designer', name: 'Designer', tag: 'Warm amber & zinc style' }
  ];

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    try {
      const res = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setDeleteModalOpen(false);
        setSelectedClient(null);
        fetchClients();
        await refetchData();
        setMessage(`Client deleted successfully.`);
      } else {
        setError(resData.message || 'Failed to delete client.');
      }
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Network error deleting client.');
    }
  };

  const openEdit = (client) => {
    setSelectedClient(client);
    setName(client.name);
    setEmail(client.email);
    setRole(client.role);
    setProfileImage(client.profileImage || '');
    setSlug(client.slug || '');
    setEditModalOpen(true);
  };

  const openDelete = (client) => {
    setSelectedClient(client);
    setDeleteModalOpen(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('');
    setProfileImage('');
    setSlug('');
    setPresetId('fresher');
    setSelectedClient(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>CLIENT PORTFOLIO MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Client Portfolios & Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage multiple client portfolios, customize content, set publication statuses, and preview across devices.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setAddModalOpen(true); }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Search & Status Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#121723] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'ALL', label: 'All Portfolios' },
            { id: 'PUBLISHED', label: 'Published' },
            { id: 'DRAFT', label: 'Drafts' },
            { id: 'UNPUBLISHED', label: 'Unpublished' },
            { id: 'PRIVATE', label: 'Private' }
          ].map((statusTab) => (
            <button
              key={statusTab.id}
              onClick={() => setStatusFilter(statusTab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === statusTab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {statusTab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, email, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

      </div>

      {/* Clients Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs">
          Loading client portfolios...
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="p-12 text-center bg-[#121723] rounded-2xl border border-slate-800 space-y-3">
          <Users className="w-10 h-10 mx-auto text-slate-500" />
          <h3 className="text-base font-bold text-white">No Clients Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your status filter or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const isActive = client.id === activeClientId;
            return (
              <div
                key={client.id}
                className={`p-6 rounded-2xl bg-[#121723] border transition-all flex flex-col justify-between space-y-5 group ${
                  isActive
                    ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 bg-gradient-to-b from-[#162030] to-[#121723]'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Status & Active Pill */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        client.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : client.status === 'UNPUBLISHED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {client.status || 'DRAFT'}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500 text-white rounded-full">
                          ACTIVE CONTEXT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button onClick={() => handleDuplicateClient(client)} className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800" title="Duplicate Portfolio">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(client)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800" title="Edit Client">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openDelete(client)} className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800" title="Delete Client">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={client.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={client.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white truncate">{client.name}</h3>
                      <p className="text-xs text-emerald-400 font-medium truncate">{client.role}</p>
                      <p className="text-[11px] text-slate-400 truncate">{client.email}</p>
                    </div>
                  </div>

                  {/* Metrics & Dates */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#0a0d14] border border-slate-800/80 text-[11px] font-mono text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Projects</span>
                      <span className="font-bold text-white">{client.projectsCount} Built</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Updated</span>
                      <span className="text-slate-300">{new Date(client.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleSelectClient(client.id)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isActive ? 'Managing Portfolio Context' : 'Manage Portfolio'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPreviewClient(client)}
                      className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(client.id, client.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
                      className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center space-x-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>{client.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Step Create Portfolio Wizard Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0f1420] text-slate-100 rounded-2xl border border-slate-800 p-6 space-y-6 my-8">
            <button 
              onClick={() => { setAddModalOpen(false); setCreateStep(1); }} 
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Wizard Header & Progress Bar */}
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>UNIVERSAL PORTFOLIO BUILDER</span>
              </div>
              <h3 className="text-xl font-bold text-white">Create New Portfolio</h3>
              <p className="text-xs text-slate-400 mt-1">Configure client details, profession preset, and UI template in 4 quick steps.</p>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-2 border-y border-slate-800/80 py-3">
              {[
                { step: 1, label: 'Client Info' },
                { step: 2, label: 'Profession' },
                { step: 3, label: 'Template' },
                { step: 4, label: 'Review' }
              ].map((s) => (
                <div 
                  key={s.step} 
                  className={`flex items-center space-x-2 p-2 rounded-xl text-xs font-semibold ${
                    createStep === s.step 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : createStep > s.step
                      ? 'text-slate-300 bg-slate-900/50'
                      : 'text-slate-500'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    createStep === s.step ? 'bg-emerald-500 text-slate-950' : createStep > s.step ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {s.step}
                  </div>
                  <span className="truncate hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Client Info */}
            {createStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0a0d14] border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="priya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0a0d14] border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Custom Display Role / Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Data Analyst & BI Specialist"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0a0d14] border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">If left blank, role will automatically match the selected profession.</p>
                </div>
              </div>
            )}

            {/* Step 2: Profession Choice */}
            {createStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <label className="block text-xs font-medium text-slate-300">Select Client Profession / Field *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {professionsList.map((p) => {
                    const IconComp = p.icon;
                    const isSelected = profession === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProfession(p.id)}
                        className={`p-3 rounded-xl border text-left flex flex-col items-start justify-between space-y-2 transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                            : 'bg-[#0a0d14] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <IconComp className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-semibold">{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                {profession === 'Other' && (
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <label className="block text-xs font-medium text-slate-300">Specify Custom Profession Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Healthcare Specialist / Sound Designer"
                      value={customProfession}
                      onChange={(e) => setCustomProfession(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#0a0d14] border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Template Selection */}
            {createStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <label className="block text-xs font-medium text-slate-300">Choose Visual Design Template *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {templatesList.map((tmpl) => {
                    const isSelected = templateId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => setTemplateId(tmpl.id)}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500'
                            : 'bg-[#0a0d14] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{tmpl.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400">{tmpl.tag}</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{tmpl.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Summary & Confirm */}
            {createStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Portfolio Configuration Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Client Name</span>
                      <span className="font-semibold text-white">{name || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Email</span>
                      <span className="font-semibold text-white">{email || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Profession</span>
                      <span className="font-semibold text-emerald-400">
                        {profession === 'Other' ? (customProfession || 'Custom') : profession}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Template</span>
                      <span className="font-semibold text-teal-400 uppercase">{templateId}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block text-[11px]">Active Role / Subtitle</span>
                      <span className="font-semibold text-slate-300">
                        {role || (profession === 'Other' ? (customProfession || 'Professional') : profession)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Clicking <strong className="text-white">Create Portfolio</strong> will generate a fully configured portfolio preloaded with starter content tailored for {profession === 'Other' ? (customProfession || 'Custom Profession') : profession}.
                </p>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (createStep === 1) {
                    setAddModalOpen(false);
                  } else {
                    setCreateStep(prev => prev - 1);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800"
              >
                {createStep === 1 ? 'Cancel' : 'Back'}
              </button>

              {createStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (createStep === 1 && (!name || !email)) {
                      setError('Name and email are required to continue.');
                      return;
                    }
                    setError('');
                    setCreateStep(prev => prev + 1);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateClient}
                  disabled={submitting}
                  className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? 'Creating Portfolio...' : 'Create Portfolio'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0f1420] text-slate-100 rounded-2xl border border-slate-800 p-6 space-y-4">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Edit Client Details</h3>

            <form onSubmit={handleEditClient} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#0a0d14] border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#0a0d14] border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Professional Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#0a0d14] border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0f1420] text-slate-100 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Delete Client {selectedClient.name}?</h3>
            </div>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete this client's portfolio? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800">
                Cancel
              </button>
              <button onClick={handleDeleteClient} className="px-6 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl">
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi Device Preview Modal */}
      {previewClient && (
        <MultiDevicePreviewModal
          client={previewClient}
          isOpen={!!previewClient}
          onClose={() => setPreviewClient(null)}
        />
      )}
    </div>
  );
};
