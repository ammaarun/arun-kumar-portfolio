import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, User, ShieldCheck } from 'lucide-react';

export const AdminDashboardPlaceholder = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard Shell</h1>
              <p className="text-xs text-slate-400">Authenticated user: {user?.username || 'Admin'}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Protected Route Access Granted</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Phase 2 Authentication and Client-side Routing initialized successfully.
          </p>
        </div>

      </div>
    </div>
  );
};
