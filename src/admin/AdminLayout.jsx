import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, User, Code2, Terminal, Briefcase, Sparkles, 
  BookOpen, MessageSquare, Mail, Settings, ExternalLink, LogOut, 
  Sun, Moon, Menu, X, ShieldCheck, Layers, Users, ChevronDown, Palette,
  Image, FileText, Rocket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

export const AdminLayout = ({ activeTab, setActiveTab, children }) => {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { refreshData } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [clients, setClients] = useState([]);
  const [activeClientId, setActiveClientId] = useState('');
  const [switchingClient, setSwitchingClient] = useState(false);

  const fetchClientsList = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setClients(resData.data || []);
        setActiveClientId(resData.activeClientId || (resData.data?.[0]?.id || ''));
      }
    } catch (err) {
      // Safe silent catch for jsdom test runner environments
    }
  };

  useEffect(() => {
    fetchClientsList();
  }, [token, activeTab]);

  const handleSelectClientContext = async (e) => {
    const newClientId = e.target.value;
    if (!newClientId || newClientId === activeClientId) return;
    setSwitchingClient(true);
    try {
      const res = await fetch(`/api/admin/clients/${newClientId}/select`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setActiveClientId(newClientId);
        if (refreshData) await refreshData();
        fetchClientsList();
      }
    } catch (err) {
      console.error('Error switching client context:', err);
    } finally {
      setSwitchingClient(false);
    }
  };

  const navCategories = [
    {
      title: 'MAIN',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'clients', label: 'Client Portfolios', icon: Users },
      ]
    },
    {
      title: 'CONTENT',
      items: [
        { id: 'profile', label: 'Profile & About', icon: User },
        { id: 'media', label: 'Media Library', icon: Image },
        { id: 'resume', label: 'Resume & CV', icon: FileText },
        { id: 'skills', label: 'Skills', icon: Code2 },
        { id: 'projects', label: 'Projects', icon: Terminal },
        { id: 'experience', label: 'Experience & Edu', icon: Briefcase },
        { id: 'services', label: 'Services', icon: Sparkles },
        { id: 'blog', label: 'Blog / Articles', icon: BookOpen },
        { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
      ]
    },
    {
      title: 'DESIGN & PUBLISHING',
      items: [
        { id: 'customize', label: 'Theme & Customizer', icon: Palette },
        { id: 'presets', label: 'Templates & Starters', icon: Layers },
        { id: 'publishing', label: 'Publishing Center', icon: Rocket },
      ]
    },
    {
      title: 'COMMUNICATION',
      items: [
        { id: 'messages', label: 'Contact Messages', icon: Mail },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'settings', label: 'Website Settings', icon: Settings },
      ]
    }
  ];

  const activeClientObj = clients.find(c => c.id === activeClientId);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#121723] border-r border-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col justify-between`}>
        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-80px)] scrollbar-thin">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-mono font-bold text-sm shadow-md shadow-emerald-500/20">
                AK
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm tracking-tight">Admin Console</span>
                <span className="text-[10px] text-emerald-400 font-mono">MULTI-CLIENT PLATFORM</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grouped Nav List */}
          <div className="space-y-4 pt-2">
            {navCategories.map((group) => (
              <div key={group.title} className="space-y-1">
                <h4 className="px-3 text-[10px] font-mono font-semibold text-slate-500 tracking-wider">
                  {group.title}
                </h4>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-[#121723]">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authenticated: {user?.username || 'admin'}</span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-xs font-semibold text-slate-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#0a0d14]/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-white capitalize hidden sm:block">
              {navCategories.flatMap(g => g.items).find(m => m.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>

          {/* Active Client Context Switcher Dropdown */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {clients.length > 0 && (
              <div className="flex items-center space-x-2 bg-[#121723] px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 hidden lg:inline">Active Context:</span>
                <div className="relative">
                  <select
                    value={activeClientId}
                    onChange={handleSelectClientContext}
                    disabled={switchingClient}
                    className="bg-transparent text-xs font-bold text-emerald-400 focus:outline-none cursor-pointer pr-4 font-sans"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#121723] text-white">
                        {c.name} ({c.status || 'DRAFT'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Site</span>
            </a>

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-white rounded-xl border border-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          </div>
        </header>

        {/* Dynamic Page View Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
};
