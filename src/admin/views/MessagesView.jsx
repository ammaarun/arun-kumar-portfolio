import React, { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle2, RefreshCw, Reply } from 'lucide-react';
import { api } from '../../services/api';

export const MessagesView = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.getMessages();
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markMessageRead(id);
      fetchMessages();
    } catch (err) {
      alert('Failed to update message');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete message?')) return;
    try {
      await api.deleteMessage(id);
      fetchMessages();
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Contact Messages Inbox</h2>
          <p className="text-xs text-slate-400">View and respond to inquiries submitted from the public contact form.</p>
        </div>
        <button
          onClick={fetchMessages}
          className="p-2 rounded-xl bg-[#121723] border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Refresh Inbox"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121723] border border-slate-800 text-slate-500 space-y-2">
          <Mail className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-sm font-medium">Your contact inbox is currently empty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-6 rounded-2xl bg-[#121723] border ${
                msg.read ? 'border-slate-800/80 opacity-80' : 'border-emerald-500/40'
              } space-y-3 transition-all`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  <h3 className="text-base font-bold text-white">{msg.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">({msg.email})</span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
                  <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                  <a
                    href={`mailto:${msg.email}?subject=RE: ${encodeURIComponent(msg.subject || 'Portfolio Inquiry')}`}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply Email</span>
                  </a>
                  {!msg.read && (
                    <button
                      onClick={() => handleMarkRead(msg.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-sans"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs font-semibold text-emerald-400 font-mono">
                Subject: {msg.subject}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#0a0d14] p-4 rounded-xl border border-slate-800">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
