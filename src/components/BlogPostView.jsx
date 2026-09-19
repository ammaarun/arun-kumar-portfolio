import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, BookOpen, Share2, Tag, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';

export const BlogPostView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useData();

  const blogs = data?.blogs || [];
  const post = blogs.find((b) => b.slug === slug || b.id === slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0d14] flex items-center justify-center p-4">
        <div className="text-emerald-500 font-mono text-sm animate-pulse flex items-center space-x-2">
          <BookOpen className="w-5 h-5 animate-spin" />
          <span>Loading article details...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0d14] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 space-y-4">
        <h2 className="text-2xl font-bold">Article Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          The requested article slug "{slug}" could not be found.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center space-x-2 hover:bg-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Portfolio</span>
        </button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0d14] text-slate-900 dark:text-slate-100 transition-colors py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portfolio</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Main Article Container */}
        <article className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          
          {/* Metadata Header */}
          <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
              <span className="flex items-center space-x-1 text-emerald-500 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{post.publishedDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>5 min read</span>
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                {post.status || 'Published'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags && post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 flex items-center space-x-1"
                >
                  <Tag className="w-3 h-3 text-emerald-500" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="rounded-xl overflow-hidden h-72 sm:h-96 shadow-md">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Lead Excerpt */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border-l-4 border-emerald-500 text-slate-800 dark:text-slate-200 text-sm font-medium italic leading-relaxed">
            "{post.excerpt}"
          </div>

          {/* Main Body Content */}
          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line">
            {post.content}
          </div>

          {/* Author Footer */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 font-mono font-bold flex items-center justify-center text-sm">
                AK
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Arun Kumar</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Java & Spring Boot Engineer</div>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>More Articles</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </article>

      </div>
    </div>
  );
};
