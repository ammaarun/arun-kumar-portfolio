import React, { useState } from 'react';
import { X, Check, Sparkles, Send, ShieldCheck, Zap, Star } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export const ClientInquiryModal = ({ isOpen, onClose, defaultPackageId = 'cms' }) => {
  const packages = siteConfig.freelanceOfferings?.packages || [];
  
  const [selectedPkgId, setSelectedPkgId] = useState(defaultPackageId);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedPkg = packages.find(p => p.id === selectedPkgId) || packages[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please provide your name and email address.');
      return;
    }
    setError('');
    setSubmitting(true);

    const payload = {
      name,
      email,
      subject: `[Client Inquiry] ${selectedPkg.name}`,
      message: `Selected Package: ${selectedPkg.name} (${selectedPkg.price} / ${selectedPkg.localPrice})\nTarget Role/Title: ${role || 'Not specified'}\n\nClient Message:\n${notes || 'No extra notes provided.'}`
    };

    try {
      const res = await fetch('/api/portfolio/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setError('Network error. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setRole('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Inquiry Received!
            </h3>
            <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto text-sm leading-relaxed">
              Thank you, <span className="font-semibold text-emerald-500">{name}</span>. Your request for the <span className="font-semibold">{selectedPkg.name}</span> package has been received into our inbox. We will reach out to <span className="font-semibold">{email}</span> within 24 hours!
            </p>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Freelance Web Development</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Request Your Custom Developer Portfolio
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Select your desired portfolio package and submit your details. Get your custom dynamic portfolio live in 48 hours.
              </p>
            </div>

            {/* Package Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPkgId;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={`relative p-5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {pkg.badge && (
                      <span className={`absolute -top-3 right-4 px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        pkg.popular
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {pkg.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {pkg.name}
                      </h4>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="mb-3 flex items-baseline space-x-1.5">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {pkg.price}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        ({pkg.localPrice})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      {pkg.description}
                    </p>

                    <ul className="space-y-1.5 border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-[11px] text-slate-700 dark:text-slate-300">
                          <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Inquiry Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              {error && (
                <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Role / Specialty
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Java Engineer / Designer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Custom Preferences / Questions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us about any specific features, color preferences, or custom requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fast 48-Hour Delivery • 100% Guaranteed</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Sending Request...' : `Submit Request (${selectedPkg.price})`}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
