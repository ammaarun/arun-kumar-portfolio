import React, { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle2, RefreshCw, Reply, ShieldAlert, ToggleLeft, ToggleRight, Save, Send, AlertCircle, Check } from 'lucide-react';
import { api } from '../../services/api';

export const MessagesView = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Contact Form Settings State
  const [contactSettings, setContactSettings] = useState({
    enabled: true,
    recipientEmail: ''
  });
  const [activeClientName, setActiveClientName] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // SMTP Testing and Diagnostics State
  const [testingEmail, setTestingEmail] = useState(false);
  const [checkingSmtp, setCheckingSmtp] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState(null);

  const fetchContactSettings = async () => {
    try {
      const res = await api.getContactSettings();
      if (res.success && res.data) {
        setContactSettings({
          enabled: res.data.enabled !== false,
          recipientEmail: res.data.recipientEmail || ''
        });
        if (res.clientName) {
          setActiveClientName(res.clientName);
        }
      }
    } catch (err) {
      console.error('Failed to load contact settings:', err);
    }
  };

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
    fetchContactSettings();
    fetchMessages();
  }, []);

  const handleSaveContactSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess('');
    setSettingsError('');

    // Optional client-side email format validation if non-empty
    if (contactSettings.recipientEmail && contactSettings.recipientEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactSettings.recipientEmail.trim())) {
        setSettingsError('Please enter a valid recipient email address.');
        setSavingSettings(false);
        return;
      }
    }

    try {
      const res = await api.updateContactSettings({
        enabled: contactSettings.enabled,
        recipientEmail: contactSettings.recipientEmail.trim()
      });
      if (res.success) {
        setSettingsSuccess(res.message || 'Contact form settings saved successfully.');
        setContactSettings({
          enabled: res.data.enabled !== false,
          recipientEmail: res.data.recipientEmail || ''
        });
        setTimeout(() => setSettingsSuccess(''), 4000);
      } else {
        setSettingsError(res.message || 'Failed to save contact settings.');
      }
    } catch (err) {
      console.error('Error saving contact settings:', err);
      setSettingsError(err.message || 'Network error while saving settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleVerifySmtp = async () => {
    setCheckingSmtp(true);
    setSettingsError('');
    setSettingsSuccess('');
    try {
      const res = await api.verifySmtp();
      setSmtpStatus(res);
      if (res.connected) {
        setSettingsSuccess(res.message);
      } else {
        setSettingsError(res.message);
      }
    } catch (err) {
      setSettingsError(err.message || 'Failed to connect to SMTP server.');
    } finally {
      setCheckingSmtp(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!contactSettings.recipientEmail || !contactSettings.recipientEmail.trim()) {
      setSettingsError('Please enter and save a recipient email address before sending a test notification.');
      return;
    }

    setTestingEmail(true);
    setSettingsError('');
    setSettingsSuccess('');
    try {
      const res = await api.sendTestEmail({
        recipientEmail: contactSettings.recipientEmail.trim()
      });
      if (res.success) {
        setSettingsSuccess(res.message || 'Test email sent successfully! Please check your Gmail inbox and spam folder.');
      } else {
        setSettingsError(res.message || 'Failed to send test email.');
      }
    } catch (err) {
      setSettingsError(err.message || 'Network error while sending test email.');
    } finally {
      setTestingEmail(false);
    }
  };

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
    <div className="space-y-8 animate-fadeIn">
      {/* ── Contact Form Settings Configuration Card ── */}
      <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span>CONTACT FORM CONFIGURATION</span>
            </div>
            <h2 className="text-xl font-bold text-white">Contact Form & Email Notifications</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure public form visibility and email notification destinations {activeClientName ? `for ${activeClientName}` : 'for this portfolio'}.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase ${
              contactSettings.enabled 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {contactSettings.enabled ? '● Form Active' : '○ Form Disabled'}
            </span>
          </div>
        </div>

        {settingsSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{settingsSuccess}</span>
          </div>
        )}

        {settingsError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{settingsError}</span>
          </div>
        )}

        <form onSubmit={handleSaveContactSettings} className="space-y-5">
          {/* Enable / Disable Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#0a0d14] border border-slate-800 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Public Contact Form</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                When enabled, the contact section and navigation link are displayed on the public portfolio. When disabled, the form is hidden and new message submissions are rejected.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setContactSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                contactSettings.enabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              {contactSettings.enabled ? (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-300" />
                  <span>Enabled (Active)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-500" />
                  <span>Disabled (Hidden)</span>
                </>
              )}
            </button>
          </div>

          {/* Recipient Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Notification Recipient Email Address</span>
              <span className="text-[11px] font-mono text-slate-500">Portfolio-Specific</span>
            </label>
            <input
              type="email"
              placeholder="e.g. owner@gmail.com"
              value={contactSettings.recipientEmail}
              onChange={(e) => setContactSettings(prev => ({ ...prev, recipientEmail: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
            <p className="text-[11px] text-slate-400">
              When visitors submit a message through this portfolio's contact form, instant email notifications will be delivered to this recipient.
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleVerifySmtp}
                disabled={checkingSmtp}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center space-x-1.5 disabled:opacity-50"
                title="Verify SMTP connectivity with Gmail"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingSmtp ? 'animate-spin' : ''}`} />
                <span>{checkingSmtp ? 'Checking...' : 'Check SMTP Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={testingEmail || !contactSettings.recipientEmail}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs border border-emerald-500/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
                title="Send a live test notification to the configured recipient email"
              >
                <Send className={`w-3.5 h-3.5 ${testingEmail ? 'animate-spin' : ''}`} />
                <span>{testingEmail ? 'Sending Test...' : 'Send Test Notification'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-2 disabled:opacity-50 ml-auto"
            >
              <Save className={`w-3.5 h-3.5 ${savingSettings ? 'animate-spin' : ''}`} />
              <span>{savingSettings ? 'Saving Settings...' : 'Save Contact Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Inbox Messages Section ── */}
      <div className="space-y-4">
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
                    
                    {/* Delivery Status Badge */}
                    {msg.emailDelivery && (
                      <span
                        title={msg.emailDelivery.error || (msg.emailDelivery.status === 'sent' ? `Delivered to ${msg.emailDelivery.recipient}` : 'SMTP credentials not configured on server')}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          msg.emailDelivery.status === 'sent'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : msg.emailDelivery.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {msg.emailDelivery.status === 'sent' ? '✓ Email: Sent' : msg.emailDelivery.status === 'failed' ? '✗ Email: Failed' : '○ Email: Not Configured'}
                      </span>
                    )}
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
    </div>
  );
};
