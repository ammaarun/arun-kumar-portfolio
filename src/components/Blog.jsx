import React, { useState } from 'react';
import { BookOpen, Calendar, Tag, ArrowRight, X, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Blog = () => {
  const { data } = useData();
  const blogs = data.blogs || [];
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <section id="blog" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ARTICLES & INSIGHTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineering Blog & Writeups
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Thoughts, technical guides, and architectural breakdowns on Java, Spring Boot, and React.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((post) => (
            <div 
              key={post.id}
              className="group rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Cover Image */}
              {post.coverImage && (
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img 
                    src={post.coverImage} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md bg-slate-900/80 text-emerald-400 backdrop-blur-md">
                      {post.status || 'Published'}
                    </span>
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{post.publishedDate}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>5 min read</span>
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                {/* Tags & Action Button */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags && post.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Article Detail Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div 
            className="relative w-full max-w-3xl bg-white dark:bg-[#121723] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1019] sticky top-0 z-10">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">Article Reader</span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto space-y-6 font-sans">
              <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                <span className="text-xs font-mono text-emerald-500 font-semibold">{selectedPost.publishedDate}</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {selectedPost.title}
                </h1>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedPost.tags && selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {selectedPost.coverImage && (
                <div className="rounded-xl overflow-hidden h-64">
                  <img src={selectedPost.coverImage} alt={selectedPost.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-4">
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 italic">
                  "{selectedPost.excerpt}"
                </p>
                <p>{selectedPost.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
