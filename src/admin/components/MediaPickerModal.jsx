import React, { useState, useEffect } from 'react';
import { Image, Upload, Search, X, Check, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MediaPickerModal = ({ isOpen, onClose, onSelectMedia, currentUrl = '' }) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'upload'
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);

  // New Upload Form state
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newCategory, setNewCategory] = useState('projects');
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media?category=${categoryFilter}&search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setMediaList(resData.data || []);
      }
    } catch (err) {
      console.error('Error fetching media library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, categoryFilter, search, token]);

  if (!isOpen) return null;

  const handleConfirmSelection = () => {
    if (selectedMedia && onSelectMedia) {
      onSelectMedia(selectedMedia.url);
      onClose();
    } else if (newMediaUrl && onSelectMedia) {
      onSelectMedia(newMediaUrl);
      onClose();
    }
  };

  const handleUploadNew = async (e) => {
    e.preventDefault();
    if (!newMediaName || !newMediaUrl) return;
    setUploading(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newMediaName,
          url: newMediaUrl,
          type: 'image',
          category: newCategory,
          sizeKb: Math.floor(Math.random() * 400 + 150),
          dimensions: '1200 x 800'
        })
      });
      const resData = await res.json();
      if (resData.success) {
        if (onSelectMedia) onSelectMedia(resData.data.url);
        onClose();
      }
    } catch (err) {
      console.error('Error uploading media:', err);
    } finally {
      setUploading(false);
    }
  };

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
              <p className="text-xs text-slate-400">Select an existing asset or upload a new media URL.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="px-6 pt-3 flex items-center justify-between border-b border-slate-800 bg-[#0a0d14]">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
                activeTab === 'library'
                  ? 'border-emerald-500 text-emerald-400 bg-[#121723]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Choose from Media Library
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'border-emerald-500 text-emerald-400 bg-[#121723]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Upload New Media Asset
            </button>
          </div>

          {activeTab === 'library' && (
            <div className="flex items-center space-x-2 py-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-[#121723] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#121723] border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="profile">Profile</option>
                <option value="projects">Projects</option>
                <option value="blogs">Blogs</option>
                <option value="certificates">Certificates</option>
                <option value="resume">Resume</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
          {activeTab === 'library' ? (
            loading ? (
              <div className="py-16 text-center text-xs font-mono text-slate-500">
                Loading assets from media library...
              </div>
            ) : mediaList.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Image className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-400">No media assets found</p>
                <p className="text-xs text-slate-500">Try adjusting your search query or upload a new image asset.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mediaList.map((item) => {
                  const isSelected = selectedMedia?.id === item.id || currentUrl === item.url;
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
                        ) : (
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
            <form onSubmit={handleUploadNew} className="max-w-xl mx-auto space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Asset Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hero Project Dashboard Screenshot"
                  value={newMediaName}
                  onChange={(e) => setNewMediaName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Media URL</label>
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
                <label className="text-xs font-mono text-slate-300">Category Tag</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="profile">Profile</option>
                  <option value="projects">Projects</option>
                  <option value="blogs">Blogs</option>
                  <option value="certificates">Certificates</option>
                  <option value="resume">Resume</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-400 transition-all"
                >
                  {uploading ? 'Uploading...' : 'Save & Select Media Asset'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0a0d14] flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-mono">
            {selectedMedia ? `Selected: ${selectedMedia.name}` : 'No asset selected'}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmSelection}
              disabled={!selectedMedia && !newMediaUrl}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all"
            >
              Use Selected Image
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
