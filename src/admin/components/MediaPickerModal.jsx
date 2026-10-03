import React, { useState, useEffect } from 'react';
import { Image, Search, X, Check, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── NeonThumb ─────────────────────────────────────────────────────────────────
// Renders a Neon-stored asset thumbnail by fetching the presigned URL with auth.
// An <img src={item.url}> would return 401; we must fetch with the Bearer token.
const NeonThumb = ({ item, token, className }) => {
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!item.objectKey || !token) return;
    let cancelled = false;
    setErr(false);
    setSrc(null);

    fetch(`/api/admin/media/serve/${encodeURIComponent(item.objectKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (!cancelled) { if (d.presignedUrl) setSrc(d.presignedUrl); else setErr(true); } })
      .catch(() => { if (!cancelled) setErr(true); });

    return () => { cancelled = true; };
  }, [item.objectKey, token]);

  if (err) return (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-1">
      <AlertCircle className="w-5 h-5" />
      <span className="text-[9px] font-mono">unavailable</span>
    </div>
  );
  if (!src) return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return <img src={src} alt={item.name} className={className} />;
};

// ── MediaPickerModal ──────────────────────────────────────────────────────────
// IMPORTANT CONTRACT CHANGE:
//   onSelectMedia now receives the FULL media record object, NOT just a URL string.
//   Callers must check media.storageBackend to decide what to store:
//     storageBackend === 'neon'  → store 'neon::<media.id>'
//     storageBackend === 'url'   → store media.url directly (backward-compatible)
// ─────────────────────────────────────────────────────────────────────────────
export const MediaPickerModal = ({ isOpen, onClose, onSelectMedia, currentUrl = '' }) => {
  const { token } = useAuth();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Quick-add URL form
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newCategory, setNewCategory] = useState('projects');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'url'

  const fetchMedia = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/media?category=${categoryFilter}&search=${encodeURIComponent(search)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const resData = await res.json();
      if (resData.success) setMediaList(resData.data || []);
    } catch (err) {
      console.error('Error fetching media library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedMedia(null);
      fetchMedia();
    }
  }, [isOpen, categoryFilter, search, token]);

  if (!isOpen) return null;

  // Determine if currentUrl represents a currently-selected Neon asset
  const currentNeonId = currentUrl?.startsWith('neon::') ? currentUrl.replace('neon::', '') : null;

  const handleConfirmSelection = () => {
    if (selectedMedia && onSelectMedia) {
      // Pass the full record — caller decides what to store
      onSelectMedia(selectedMedia);
      onClose();
    }
  };

  // Quick-add URL-paste asset and immediately select it
  const handleAddUrlAsset = async (e) => {
    e.preventDefault();
    if (!newMediaName || !newMediaUrl) return;
    setUploading(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newMediaName,
          url: newMediaUrl,
          type: 'image',
          category: newCategory,
          sizeKb: Math.floor(Math.random() * 400 + 150),
          dimensions: '1200 x 800',
        }),
      });
      const resData = await res.json();
      if (resData.success && onSelectMedia) {
        // Select the newly-created URL-paste asset immediately
        onSelectMedia(resData.data);
        onClose();
      }
    } catch (err) {
      console.error('Error saving media URL:', err);
    } finally {
      setUploading(false);
    }
  };

  const categoriesList = [
    { id: 'all', label: 'All' },
    { id: 'profile', label: 'Profile' },
    { id: 'projects', label: 'Projects' },
    { id: 'blogs', label: 'Blog' },
    { id: 'certificates', label: 'Certs' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#121723] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Media Library Picker</h3>
              <p className="text-xs text-slate-400">Select an existing asset or add a new URL.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs + Filters */}
        <div className="px-6 pt-3 flex items-center justify-between border-b border-slate-800 bg-[#0a0d14] flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all ${activeTab === 'library' ? 'border-emerald-500 text-emerald-400 bg-[#121723]' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Choose from Library
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all ${activeTab === 'url' ? 'border-emerald-500 text-emerald-400 bg-[#121723]' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Paste URL
            </button>
          </div>

          {activeTab === 'library' && (
            <div className="flex items-center space-x-2 py-1 flex-wrap gap-1">
              {categoriesList.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${categoryFilter === c.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
                >
                  {c.label}
                </button>
              ))}
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-6 pr-2 py-1.5 bg-[#121723] border border-slate-800 rounded-lg text-[10px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-32"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
          {activeTab === 'library' ? (
            loading ? (
              <div className="py-16 text-center text-xs font-mono text-slate-500">Loading media library...</div>
            ) : mediaList.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Image className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-400">No media assets found</p>
                <p className="text-xs text-slate-500">Upload assets in Media Library or paste a URL above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mediaList.map((item) => {
                  const isSelected = selectedMedia?.id === item.id
                    || (currentNeonId && currentNeonId === item.id)
                    || (!currentNeonId && currentUrl === item.url);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      className={`relative rounded-xl border overflow-hidden cursor-pointer group transition-all ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/10'
                          : 'border-slate-800 bg-[#0a0d14] hover:border-slate-700'
                      }`}
                    >
                      <div className="h-32 bg-slate-900 overflow-hidden relative">
                        {item.type === 'document' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                            <FileText className="w-8 h-8 text-emerald-400" />
                            <span className="text-[10px] font-mono">{item.sizeKb} KB</span>
                          </div>
                        ) : item.storageBackend === 'neon' && item.objectKey ? (
                          // Neon asset: fetch thumbnail with auth token
                          <NeonThumb
                            item={item}
                            token={token}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          // URL-paste asset: direct src
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}

                        {isSelected && (
                          <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-white shadow-lg">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}

                        {/* Neon badge */}
                        {item.storageBackend === 'neon' && (
                          <div className="absolute bottom-1 left-1">
                            <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold bg-slate-950/90 text-teal-400 rounded border border-teal-500/30">
                              Neon
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 space-y-1">
                        <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800">{item.category}</span>
                          <span>{item.sizeKb} KB</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // URL paste tab
            <form onSubmit={handleAddUrlAsset} className="max-w-xl mx-auto space-y-4 py-4">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 text-xs text-slate-400">
                Paste any public image URL. The URL will be saved to your Media Library and selected.
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Asset Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hero Project Screenshot"
                  value={newMediaName}
                  onChange={(e) => setNewMediaName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="profile">Profile</option>
                  <option value="projects">Projects</option>
                  <option value="blogs">Blogs</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-400 transition-all disabled:opacity-50"
                >
                  {uploading ? 'Saving...' : 'Save & Select URL Asset'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0a0d14] flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 font-mono truncate max-w-xs">
            {selectedMedia ? (
              <span>
                Selected: <span className="text-white font-semibold">{selectedMedia.name}</span>
                {selectedMedia.storageBackend === 'neon' && (
                  <span className="ml-2 text-teal-400">[Neon]</span>
                )}
              </span>
            ) : 'No asset selected'}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedMedia}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all"
            >
              Use Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
