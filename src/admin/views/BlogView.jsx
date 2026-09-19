import React, { useState } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';

export const BlogView = () => {
  const { data, refreshData } = useData();
  const blogs = data.blogs || [];

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80');
  const [saving, setSaving] = useState(false);

  const handleTitleChange = (val) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    setSaving(true);
    const tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);
    try {
      await api.addBlog({ title, slug, excerpt, content, tags, coverImage, status: 'Published' });
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      setTagsInput('');
      await refreshData();
    } catch (err) {
      alert('Failed to publish article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete article?')) return;
    try {
      await api.deleteBlog(id);
      await refreshData();
    } catch (err) {
      alert('Failed to delete article');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Blog & Technical Articles CMS</h2>
        <p className="text-xs text-slate-400">Publish and manage technical writeups on Java, Spring Boot, and React.</p>
      </div>

      <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Publish New Article</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Article Title *</label>
            <input
              type="text"
              required
              placeholder="Building Resilient Microservices..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Slug (URL snippet)</label>
            <input
              type="text"
              readOnly
              value={slug}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-slate-400 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="Java, Spring Boot, Kafka"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Cover Image URL</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300">Short Summary Excerpt</label>
          <input
            type="text"
            required
            placeholder="A deep dive into distributed transaction management..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300">Full Article Content (Markdown supported) *</label>
          <textarea
            rows={5}
            required
            placeholder="Write full article body text here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{saving ? 'Publishing...' : 'Publish Article'}</span>
        </button>
      </form>

      <div className="space-y-4">
        {blogs.map((b) => (
          <div key={b.id} className="p-5 rounded-2xl bg-[#121723] border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono text-emerald-400">{b.publishedDate}</span>
              <h3 className="text-base font-bold text-white">{b.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-1">{b.excerpt}</p>
            </div>
            <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
