import React from 'react';
import { Terminal, Code2, Mail, BookOpen, ArrowRight, CheckCircle2, User } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const OverviewView = ({ setActiveTab }) => {
  const { data } = useData();

  const projectsCount = data.projects?.length || 0;
  const skillsCount = (data.skills || []).reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
  const blogsCount = data.blogs?.length || 0;
  const messages = data.messages || [];
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#121723] to-[#121723] border border-emerald-500/30 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white">
            Welcome back, {data.personalInfo?.name || 'Arun Kumar'} 👋
          </h1>
          <p className="text-xs text-slate-400">
            Manage your personal brand, projects, skills, articles, and freelancing services.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('profile')}
          className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all"
        >
          <User className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-[#121723] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Projects</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{projectsCount}</div>
          <button onClick={() => setActiveTab('projects')} className="text-xs text-emerald-400 hover:underline flex items-center space-x-1 font-semibold">
            <span>Manage Projects</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[#121723] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Skills</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{skillsCount}</div>
          <button onClick={() => setActiveTab('skills')} className="text-xs text-emerald-400 hover:underline flex items-center space-x-1 font-semibold">
            <span>Manage Skills</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[#121723] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Unread Messages</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{unreadCount}</div>
          <button onClick={() => setActiveTab('messages')} className="text-xs text-emerald-400 hover:underline flex items-center space-x-1 font-semibold">
            <span>View Messages</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[#121723] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Published Articles</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{blogsCount}</div>
          <button onClick={() => setActiveTab('blog')} className="text-xs text-emerald-400 hover:underline flex items-center space-x-1 font-semibold">
            <span>Manage Blog</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Recent Contact Submissions Widget */}
      <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>Recent Contact Messages</span>
          </h3>
          <button onClick={() => setActiveTab('messages')} className="text-xs text-emerald-400 hover:underline">
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

    </div>
  );
};
