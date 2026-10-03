import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Image, Plus, Search, Trash2, Eye, RefreshCw, Upload,
  CheckCircle2, FileText, Download, X,
  CloudUpload, Link as LinkIcon, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── NeonImage ─────────────────────────────────────────────────────────────────
// Fetches a presigned GET URL from the authenticated serve endpoint and renders
// the image. An <img> tag cannot attach Authorization headers, so we must fetch
// the presigned URL server-side (with the token), then use it as <img src>.
const NeonImage = ({ asset, token, className }) => {
  const [src, setSrc] = useState(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!asset.objectKey || !token) return;
    let cancelled = false;
    setErrored(false);
    setSrc(null);

    const fetchPresigned = async () => {
      try {
        const res = await fetch(
          `/api/admin/media/serve/${encodeURIComponent(asset.objectKey)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          if (!cancelled) setErrored(true);
          return;
        }
        const data = await res.json();
        if (!cancelled && data.presignedUrl) {
          setSrc(data.presignedUrl);
        } else if (!cancelled) {
          setErrored(true);
        }
      } catch {
        if (!cancelled) setErrored(true);
      }
    };

    fetchPresigned();
    return () => { cancelled = true; };
  }, [asset.objectKey, token]);

  if (errored) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-slate-500 space-y-1">
        <AlertCircle className="w-8 h-8" />
        <span className="text-[10px] font-mono">Preview failed</span>
      </div>
    );
  }
  if (!src) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return <img src={src} alt={asset.name} className={className} />;
};

// ── NeonPreviewModal ─────────────────────────────────────────────────────────
// Fetches the presigned URL when the modal opens, shows a spinner while loading.
const NeonPreviewModal = ({ asset, token, onClose }) => {
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!asset.objectKey) return;
    setLoading(true);
    setErr(null);

    fetch(
      `/api/admin/media/serve/${encodeURIComponent(asset.objectKey)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(r => r.json())
      .then(data => {
        if (data.presignedUrl) setPresignedUrl(data.presignedUrl);
        else setErr(data.message || 'Could not load preview.');
      })
      .catch(() => setErr('Network error loading preview.'))
      .finally(() => setLoading(false));
  }, [asset.objectKey, token]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#121723] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white truncate">{asset.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 min-h-32 overflow-hidden rounded-xl border border-slate-800 bg-[#0a0d14] flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center space-y-2 text-slate-400">
              <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Loading from Neon storage...</span>
            </div>
          )}
          {err && (
            <div className="flex flex-col items-center space-y-2 text-rose-400 p-8 text-center">
              <AlertCircle className="w-8 h-8" />
              <span className="text-xs font-mono">{err}</span>
            </div>
          )}
          {!loading && !err && presignedUrl && asset.type === 'document' && (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-16 h-16 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-white">{asset.name}</p>
              <p className="text-xs text-slate-400 font-mono">PDF Document ({asset.sizeKb} KB)</p>
              <a
                href={presignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          )}
          {!loading && !err && presignedUrl && asset.type !== 'document' && (
            <img src={presignedUrl} alt={asset.name} className="max-h-96 w-auto object-contain" />
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 flex-wrap gap-2">
          <span>Category: {asset.category}</span>
          <span>Size: {asset.sizeKb} KB</span>
          <span className="text-teal-400">Stored: Neon Object Storage</span>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const MediaLibraryView = () => {
  const { token } = useAuth();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [replaceAsset, setReplaceAsset] = useState(null);

  // Upload form
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('image');
  const [category, setCategory] = useState('projects');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Replace form (for Neon assets)
  const [replaceFile, setReplaceFile] = useState(null);
  const replaceFileInputRef = useRef(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchMedia = useCallback(async () => {
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
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  }, [token, categoryFilter, search]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const resetUploadForm = () => {
    setName(''); setUrl(''); setType('image'); setCategory('projects');
    setSelectedFile(null); setUploadProgress(null); setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── File Upload → Neon ──────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!name) { setError('Please enter an asset name.'); return; }
    if (!selectedFile) { setError('Please select a file to upload.'); return; }
    setSubmitting(true); setError(''); setUploadProgress('uploading');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', name);
      formData.append('category', category);
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const resData = await res.json();
      if (resData.success) {
        setUploadProgress('done');
        setUploadOpen(false);
        resetUploadForm();
        fetchMedia();
        setMessage('File uploaded to Neon Object Storage.');
        setTimeout(() => setMessage(''), 4000);
      } else {
        setUploadProgress(null);
        setError(resData.message || 'Upload failed.');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadProgress(null);
      setError('Network error during upload.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── URL-paste save ──────────────────────────────────────────────────────────
  const handleUploadMedia = async (e) => {
    e.preventDefault();
    if (!name || !url) return;
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name, url, type, category,
          sizeKb: Math.floor(Math.random() * 450 + 120),
          dimensions: type === 'document' ? 'PDF Document' : '1200 x 800',
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setUploadOpen(false); resetUploadForm(); fetchMedia();
        setMessage('Media URL saved to library.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(resData.message || 'Failed to save asset.');
      }
    } catch (err) {
      console.error('Error saving media URL:', err);
      setError('Network error saving asset.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Replace: Neon asset → upload new file ───────────────────────────────────
  const handleReplaceNeonAsset = async (e) => {
    e.preventDefault();
    if (!replaceAsset || !replaceFile) return;
    setSubmitting(true); setError('');
    try {
      const formData = new FormData();
      formData.append('file', replaceFile);
      const res = await fetch(`/api/admin/media/${replaceAsset.id}/replace`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const resData = await res.json();
      if (resData.success) {
        setReplaceAsset(null); setReplaceFile(null);
        if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
        fetchMedia();
        setMessage('Neon asset replaced successfully.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(resData.message || 'Replace failed.');
      }
    } catch (err) {
      console.error('Error replacing Neon asset:', err);
      setError('Network error during replace.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Replace: URL-paste asset → update URL ───────────────────────────────────
  const handleReplaceUrlAsset = async (e) => {
    e.preventDefault();
    if (!replaceAsset || !url) return;
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`/api/admin/media/${replaceAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: name || replaceAsset.name,
          url,
          type: replaceAsset.type,
          category: replaceAsset.category,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setReplaceAsset(null); setUrl(''); setName(''); fetchMedia();
        setMessage('Media asset replaced successfully.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(resData.message || 'Replace failed.');
      }
    } catch (err) {
      console.error('Error replacing media:', err);
      setError('Network error during replace.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteMedia = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media asset?')) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (resData.success) {
        fetchMedia();
        setMessage('Media asset deleted.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(resData.message || 'Delete failed.');
      }
    } catch (err) {
      console.error('Error deleting media asset:', err);
      setError('Network error during delete.');
    }
  };

  const categoriesList = [
    { id: 'all', label: 'All Assets' },
    { id: 'profile', label: 'Profile' },
    { id: 'projects', label: 'Projects' },
    { id: 'blogs', label: 'Blog Images' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'resume', label: 'Resume Documents' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold mb-2">
            <Image className="w-3.5 h-3.5" />
            <span>PORTFOLIO ASSET MANAGER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Media Library</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage reusable portfolio images, certificate documents, badges, and blog artwork.
          </p>
        </div>
        <button
          onClick={() => { resetUploadForm(); setUploadOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Media Asset</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="p-4 rounded-2xl bg-[#121723] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1">
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search media by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-slate-500">Loading portfolio media assets...</div>
      ) : mediaList.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#121723] border border-slate-800 text-center space-y-3">
          <Image className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Media Assets Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload profile pictures, project cards, and certificate assets to manage them centrally.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mediaList.map((asset) => (
            <div
              key={asset.id}
              className="rounded-2xl bg-[#121723] border border-slate-800/80 overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-all"
            >
              <div className="h-44 bg-[#0a0d14] relative overflow-hidden flex items-center justify-center">
                {asset.type === 'document' ? (
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <FileText className="w-12 h-12 text-emerald-400" />
                    <span className="text-xs font-mono">{asset.sizeKb} KB</span>
                  </div>
                ) : asset.storageBackend === 'neon' && asset.objectKey ? (
                  // Neon asset: fetch presigned URL with auth token
                  <NeonImage
                    asset={asset}
                    token={token}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  // URL-paste asset: direct src
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-950/80 text-emerald-400 rounded-md border border-emerald-500/30 backdrop-blur-md capitalize">
                    {asset.category}
                  </span>
                  {asset.storageBackend === 'neon' && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-950/80 text-teal-400 rounded-md border border-teal-500/30 backdrop-blur-md">
                      Neon
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{asset.name}</h4>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-1">
                    <span>{asset.dimensions}</span>
                    <span>{asset.sizeKb} KB</span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-600 mt-0.5">Uploaded: {asset.uploadDate}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <button
                    onClick={() => setPreviewAsset(asset)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => {
                      setReplaceAsset(asset);
                      setName(asset.name);
                      setUrl(asset.storageBackend === 'neon' ? '' : asset.url);
                      setReplaceFile(null);
                      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                    <span>Replace</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMedia(asset.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: UPLOAD MEDIA */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#121723] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload Portfolio Asset</span>
              </h3>
              <button onClick={() => { setUploadOpen(false); resetUploadForm(); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-xl bg-[#0a0d14] border border-slate-800 p-1">
              <button type="button" onClick={() => setUploadMode('file')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${uploadMode === 'file' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <CloudUpload className="w-3.5 h-3.5" /><span>Upload File</span>
              </button>
              <button type="button" onClick={() => setUploadMode('url')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${uploadMode === 'url' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                <LinkIcon className="w-3.5 h-3.5" /><span>Paste URL</span>
              </button>
            </div>

            {uploadMode === 'file' ? (
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Asset Name / Title</label>
                  <input type="text" required placeholder="e.g. Profile Photo 2026" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">
                    File <span className="text-slate-500">(JPEG, PNG, WebP, GIF, PDF · max 10 MB)</span>
                  </label>
                  <div onClick={() => fileInputRef.current?.click()}
                    className={`w-full px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-center ${selectedFile ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-slate-700 hover:border-emerald-500/50 bg-[#0a0d14]'}`}>
                    {selectedFile ? (
                      <div className="space-y-1">
                        <CloudUpload className="w-6 h-6 text-emerald-400 mx-auto" />
                        <p className="text-xs font-semibold text-emerald-400 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] font-mono text-slate-500">{Math.round(selectedFile.size / 1024)} KB · {selectedFile.type}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <CloudUpload className="w-6 h-6 text-slate-500 mx-auto" />
                        <p className="text-xs text-slate-400">Click to select a file</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500">
                    <option value="profile">Profile</option>
                    <option value="projects">Projects</option>
                    <option value="blogs">Blogs</option>
                    <option value="certificates">Certificates</option>
                    <option value="resume">Resume</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {error && <p className="text-xs text-rose-400 font-mono">{error}</p>}
                {uploadProgress === 'uploading' && (
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono">
                    <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <span>Uploading to Neon Object Storage...</span>
                  </div>
                )}
                <div className="pt-3 flex justify-end space-x-2">
                  <button type="button" onClick={() => { setUploadOpen(false); resetUploadForm(); }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white">Cancel</button>
                  <button type="submit" disabled={submitting || !selectedFile || !name}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white shadow-lg shadow-emerald-500/20">
                    {submitting ? 'Uploading...' : 'Upload to Neon'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUploadMedia} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Asset Name / Title</label>
                  <input type="text" required placeholder="e.g. Profile Photo 2026" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Image / File URL</label>
                  <input type="url" required placeholder="https://images.unsplash.com/..." value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Asset Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500">
                      <option value="image">Image</option>
                      <option value="document">Document (PDF)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500">
                      <option value="profile">Profile</option>
                      <option value="projects">Projects</option>
                      <option value="blogs">Blogs</option>
                      <option value="certificates">Certificates</option>
                      <option value="resume">Resume</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                {error && <p className="text-xs text-rose-400 font-mono">{error}</p>}
                <div className="pt-3 flex justify-end space-x-2">
                  <button type="button" onClick={() => { setUploadOpen(false); resetUploadForm(); }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20">
                    {submitting ? 'Saving...' : 'Save to Library'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: PREVIEW ASSET */}
      {previewAsset && (
        previewAsset.storageBackend === 'neon' && previewAsset.objectKey ? (
          // Neon asset: dedicated modal that fetches presigned URL with auth
          <NeonPreviewModal asset={previewAsset} token={token} onClose={() => setPreviewAsset(null)} />
        ) : (
          // URL-paste asset: direct render
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-[#121723] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white truncate">{previewAsset.name}</h3>
                <button onClick={() => setPreviewAsset(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-96 overflow-hidden rounded-xl border border-slate-800 bg-[#0a0d14] flex items-center justify-center">
                {previewAsset.type === 'document' ? (
                  <div className="p-12 text-center space-y-3">
                    <FileText className="w-16 h-16 text-emerald-400 mx-auto" />
                    <p className="text-sm font-semibold text-white">{previewAsset.name}</p>
                    <p className="text-xs text-slate-400 font-mono">PDF Document ({previewAsset.sizeKb} KB)</p>
                  </div>
                ) : (
                  <img src={previewAsset.url} alt={previewAsset.name} className="max-h-96 w-auto object-contain" />
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 flex-wrap gap-2">
                <span>Category: {previewAsset.category}</span>
                <span>Dimensions: {previewAsset.dimensions}</span>
                <span>Size: {previewAsset.sizeKb} KB</span>
              </div>
            </div>
          </div>
        )
      )}

      {/* MODAL 3: REPLACE ASSET */}
      {replaceAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#121723] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Replace: {replaceAsset.name}</h3>
              <button onClick={() => { setReplaceAsset(null); setReplaceFile(null); setError(''); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {replaceAsset.storageBackend === 'neon' ? (
              // Neon replace: file upload
              <form onSubmit={handleReplaceNeonAsset} className="space-y-4">
                <p className="text-xs text-slate-400 font-mono">
                  Upload a new file to replace this Neon Object Storage asset. The old file will be deleted after the replacement is confirmed.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">
                    Replacement File <span className="text-slate-500">(JPEG, PNG, WebP, GIF, PDF · max 10 MB)</span>
                  </label>
                  <div onClick={() => replaceFileInputRef.current?.click()}
                    className={`w-full px-4 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-center ${replaceFile ? 'border-teal-500/60 bg-teal-500/5' : 'border-slate-700 hover:border-teal-500/50 bg-[#0a0d14]'}`}>
                    {replaceFile ? (
                      <div className="space-y-1">
                        <CloudUpload className="w-5 h-5 text-teal-400 mx-auto" />
                        <p className="text-xs font-semibold text-teal-400 truncate">{replaceFile.name}</p>
                        <p className="text-[10px] font-mono text-slate-500">{Math.round(replaceFile.size / 1024)} KB</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <CloudUpload className="w-5 h-5 text-slate-500 mx-auto" />
                        <p className="text-xs text-slate-400">Click to select replacement file</p>
                      </div>
                    )}
                  </div>
                  <input ref={replaceFileInputRef} type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setReplaceFile(f); }} />
                </div>
                {error && <p className="text-xs text-rose-400 font-mono">{error}</p>}
                <div className="pt-3 flex justify-end space-x-2">
                  <button type="button" onClick={() => { setReplaceAsset(null); setReplaceFile(null); setError(''); }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-slate-300">Cancel</button>
                  <button type="submit" disabled={submitting || !replaceFile}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white">
                    {submitting ? 'Replacing...' : 'Replace Asset'}
                  </button>
                </div>
              </form>
            ) : (
              // URL-paste replace: URL input
              <form onSubmit={handleReplaceUrlAsset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">New Image / Document URL</label>
                  <input type="url" required value={url} onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
                {error && <p className="text-xs text-rose-400 font-mono">{error}</p>}
                <div className="pt-3 flex justify-end space-x-2">
                  <button type="button" onClick={() => { setReplaceAsset(null); setError(''); }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-slate-300">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white">
                    {submitting ? 'Replacing...' : 'Replace Asset'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
