import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Trash2, Eye, Download, CheckCircle2, 
  Check, Star, ShieldCheck, Clock, Plus, X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const ResumeView = () => {
  const { token } = useAuth();
  const { refreshData } = useData();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchResumes = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resumes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setResumes(resData.data || []);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [token]);

  const activeResume = resumes.find(r => r.isActive) || resumes[0];

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!name || !url) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          url,
          sizeKb: Math.floor(Math.random() * 200 + 250)
        })
      });
      const resData = await res.json();
      if (resData.success) {
        setUploadModalOpen(false);
        setName('');
        setUrl('');
        if (refreshData) await refreshData();
        fetchResumes();
        setMessage('New resume version uploaded and activated!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(resData.message || 'Failed to upload resume.');
      }
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError('Network error uploading resume.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectActive = async (id) => {
    try {
      const res = await fetch(`/api/admin/resumes/${id}/select`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        if (refreshData) await refreshData();
        fetchResumes();
        setMessage(resData.message);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error selecting active resume:', err);
    }
  };

  const handleDeleteResume = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume version?')) return;
    try {
      const res = await fetch(`/api/admin/resumes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        if (refreshData) await refreshData();
        fetchResumes();
        setMessage('Resume version deleted.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting resume:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>RESUME & CV MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Resume Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage public resume downloads, version history, and active CV files.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Resume Version</span>
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

      {/* Active Resume Spotlight Banner */}
      {activeResume ? (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141e2e] via-[#121723] to-[#141e2e] border border-emerald-500/40 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                    ACTIVE PUBLIC RESUME
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">{activeResume.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Uploaded on {activeResume.uploadDate} • {activeResume.sizeKb} KB</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={activeResume.url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1.5 transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Preview</span>
              </a>

              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center space-x-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-teal-400" />
                <span>Replace</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>This resume version is linked to the public <strong>[Download CV]</strong> button on your portfolio website.</span>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-[#121723] border border-slate-800 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Resume Uploaded</h3>
          <p className="text-xs text-slate-400">Upload your professional CV to enable public resume downloads.</p>
        </div>
      )}

      {/* Resume Versions History Table */}
      <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Resume Version History</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Manage historical CV versions. Only the active version is exposed publicly.</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-slate-500">
            Loading resume versions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Version / File Name</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {resumes.map((resItem) => (
                  <tr key={resItem.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate max-w-xs">{resItem.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{resItem.uploadDate}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{resItem.sizeKb} KB</td>
                    <td className="py-3.5 px-4">
                      {resItem.isActive ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {!resItem.isActive && (
                        <button
                          onClick={() => handleSelectActive(resItem.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                        >
                          Set Active
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteResume(resItem.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Version"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#121723] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload New Resume Version</span>
              </h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadResume} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arun-Kumar-Resume-2026.pdf"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Resume PDF Document URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://.../resume.pdf"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? 'Uploading...' : 'Save & Activate Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
