import React, { useState, useEffect } from 'react';
import { 
  Terminal, Code2, Mail, BookOpen, ArrowRight, CheckCircle2, User, 
  Users, Plus, ShieldCheck, Sparkles, Eye, Clock, CheckSquare, Square, ExternalLink, AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { calculatePortfolioCompletion } from '../../utils/portfolioUtils';
import { MultiDevicePreviewModal } from '../components/MultiDevicePreviewModal';

export const OverviewView = ({ setActiveTab }) => {
  const { data, refreshData } = useData();
  const { token } = useAuth();

  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [loadingClients, setLoadingClients] = useState(true);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [activities, setActivities] = useState([]);

  const fetchClients = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setClients(resData.data || []);
        const currentActive = (resData.data || []).find(c => c.id === resData.activeClientId) || resData.data?.[0];
        setActiveClient(currentActive || null);
      }
    } catch (err) {
      // Safe silent catch for jsdom test runner environments
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchActivities = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/activities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setActivities(resData.data || []);
      }
    } catch (err) {
      // Safe catch
    }
  };

  useEffect(() => {
    fetchClients();
    fetchActivities();
  }, [token, data]);

  const handleStatusUpdate = async (status) => {
    if (!activeClient) return;
    try {
      const res = await fetch(`/api/admin/clients/${activeClient.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const resData = await res.json();
      if (resData.success) {
        setStatusMessage(`Portfolio status updated to ${status}.`);
        fetchClients();
        if (refreshData) refreshData();
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const projectsCount = data.projects?.length || 0;
  const skillsCount = (data.skills || []).reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
  const blogsCount = data.blogs?.length || 0;
  const messages = data.messages || [];
  const unreadCount = messages.filter(m => !m.read).length;

  const totalClientsCount = clients.length;
  const publishedClientsCount = clients.filter(c => c.status === 'PUBLISHED').length;
  const draftClientsCount = clients.filter(c => c.status !== 'PUBLISHED').length;

  const completion = calculatePortfolioCompletion(data, activeClient);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Active Portfolio Banner & Status Control Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#121723] to-[#121723] border border-emerald-500/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <img
              src={activeClient?.profileImage || data.personalInfo?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={data.personalInfo?.name || 'Client Profile'}
              className="w-14 h-14 rounded-2xl object-cover border border-emerald-500/40 shadow-lg shadow-emerald-500/10 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-xl font-bold text-white">
                  {data.personalInfo?.name || 'Arun Kumar'}
                </h1>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  activeClient?.status === 'PUBLISHED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : activeClient?.status === 'UNPUBLISHED'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {activeClient?.status || 'DRAFT'}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  Active Context
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {data.personalInfo?.role || 'Software Developer'} • {data.personalInfo?.email || 'admin@example.com'}
              </p>
              {activeClient?.lastPublishedAt ? (
                <p className="text-[11px] text-slate-500 font-mono flex items-center space-x-1 pt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Last Published: {new Date(activeClient.lastPublishedAt).toLocaleString()}</span>
                </p>
              ) : (
                <p className="text-[11px] text-amber-400/80 font-mono pt-0.5">
                  Not published yet (Draft state)
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button
              onClick={() => handleStatusUpdate('DRAFT')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              Save Draft
            </button>

            <button
              onClick={() => setPreviewModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-emerald-400 flex items-center space-x-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Preview</span>
            </button>

            <button
              onClick={() => handleStatusUpdate(activeClient?.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all flex items-center space-x-1.5 ${
                activeClient?.status === 'PUBLISHED'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{activeClient?.status === 'PUBLISHED' ? 'Unpublish' : 'Publish Portfolio'}</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Clients */}
        <div className="p-4 rounded-2xl bg-[#121723] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Total Clients</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white">{totalClientsCount}</div>
          <button onClick={() => setActiveTab('clients')} className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1 font-semibold">
            <span>Manage Clients</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Total Projects */}
        <div className="p-4 rounded-2xl bg-[#121723] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Total Projects</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white">{projectsCount}</div>
          <button onClick={() => setActiveTab('projects')} className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1 font-semibold">
            <span>Manage Projects</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Total Skills */}
        <div className="p-4 rounded-2xl bg-[#121723] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Total Skills</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white">{skillsCount}</div>
          <button onClick={() => setActiveTab('skills')} className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1 font-semibold">
            <span>Manage Skills</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Unread Messages */}
        <div className="p-4 rounded-2xl bg-[#121723] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Unread Msgs</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white">{unreadCount}</div>
          <button onClick={() => setActiveTab('messages')} className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1 font-semibold">
            <span>View Messages</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Published Portfolios */}
        <div className="p-4 rounded-2xl bg-[#121723] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Published</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white">{publishedClientsCount}</div>
          <span className="text-[10px] text-slate-400">Publicly visible</span>
        </div>

        {/* Draft Portfolios */}
        <div className="p-4 rounded-2xl bg-[#121723] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Drafts</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white">{draftClientsCount}</div>
          <span className="text-[10px] text-slate-400">In progress</span>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="p-5 rounded-2xl bg-[#121723] border border-slate-800 space-y-3">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Quick Actions</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('projects')}
            className="px-3.5 py-2 rounded-xl bg-[#0a0d14] hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-emerald-400 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Project</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className="px-3.5 py-2 rounded-xl bg-[#0a0d14] hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-emerald-400 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Skill</span>
          </button>

          <button
            onClick={() => setActiveTab('experience')}
            className="px-3.5 py-2 rounded-xl bg-[#0a0d14] hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-emerald-400 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Experience</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="px-3.5 py-2 rounded-xl bg-[#0a0d14] hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-emerald-400 flex items-center space-x-1.5 transition-all"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setPreviewModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#0a0d14] hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-emerald-400 flex items-center space-x-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Preview Portfolio</span>
          </button>

          <button
            onClick={() => handleStatusUpdate(activeClient?.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold text-emerald-400 flex items-center space-x-1.5 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeClient?.status === 'PUBLISHED' ? 'Unpublish Portfolio' : 'Publish Portfolio'}</span>
          </button>
        </div>
      </div>

      {/* Portfolio Completion Progress Widget */}
      <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Portfolio Completion Score</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete these portfolio sections to maximize potential client engagement and SEO visibility.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {completion.percentage}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({completion.completedCount} / {completion.totalCount} completed)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#0a0d14] h-3 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
            style={{ width: `${completion.percentage}%` }}
          />
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {completion.items.map((item) => (
            <div
              key={item.key}
              onClick={() => setActiveTab(item.tabId)}
              className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                item.completed
                  ? 'bg-[#0a0d14]/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  : 'bg-amber-500/5 border-amber-500/20 text-amber-300 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="truncate">{item.label}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Contact Submissions Widget */}
      <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>Recent Contact Messages</span>
          </h3>
          <button onClick={() => setActiveTab('messages')} className="text-xs text-emerald-400 hover:underline font-semibold">
            View Inbox ({messages.length})
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No contact messages received yet.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.slice(0, 3).map((msg) => (
              <div key={msg.id} className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">{msg.name}</span>
                    <span className="text-xs text-slate-500">({msg.email})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{msg.message}</p>
                </div>
                <a href={`mailto:${msg.email}`} className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white">
                  Reply
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Log Feed */}
      <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Recent System Activity Log</span>
          </h3>
          <span className="text-xs font-mono text-slate-500">Real-time Admin Audit Trail</span>
        </div>

        {activities.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 font-mono">
            No activity logged yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="p-3.5 rounded-xl bg-[#0a0d14] border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">{act.description}</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-slate-800">{act.clientName || 'Arun Kumar'}</span>
                  <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Multi-Device Preview Modal */}
      {previewModalOpen && activeClient && (
        <MultiDevicePreviewModal
          client={activeClient}
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}
    </div>
  );
};
