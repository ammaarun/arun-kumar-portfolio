import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Briefcase,
  GraduationCap,
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';

export const ExperienceView = () => {
  const { data, refreshData } = useData();
  const experience = data.experience || [];
  const education = data.education || [];

  const [activeTab, setActiveTab] = useState('experience'); // 'experience' | 'education'
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Experience Modal State
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState(null);
  const [expSaving, setExpSaving] = useState(false);
  const [expModalError, setExpModalError] = useState('');
  const [expForm, setExpForm] = useState({
    company: '',
    role: '',
    period: '2024 - Present',
    location: '',
    type: 'Full-time',
    achievementsInput: ''
  });

  // Education Modal State
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEduId, setEditingEduId] = useState(null);
  const [eduSaving, setEduSaving] = useState(false);
  const [eduModalError, setEduModalError] = useState('');
  const [eduForm, setEduForm] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    period: '',
    location: '',
    gradeGpa: '',
    description: ''
  });

  // --- Work Experience Handlers ---
  const openNewExperienceModal = () => {
    setEditingExpId(null);
    setExpModalError('');
    setExpSaving(false);
    setExpForm({
      company: '',
      role: '',
      period: '2024 - Present',
      location: '',
      type: 'Full-time',
      achievementsInput: ''
    });
    setExpModalOpen(true);
  };

  const openEditExperienceModal = (item) => {
    setEditingExpId(item.id);
    setExpModalError('');
    setExpSaving(false);
    const achievementsText = Array.isArray(item.achievements)
      ? item.achievements.join('\n')
      : (item.achievements || '');
    setExpForm({
      company: item.company || '',
      role: item.role || '',
      period: item.period || '',
      location: item.location || '',
      type: item.type || 'Full-time',
      achievementsInput: achievementsText
    });
    setExpModalOpen(true);
  };

  const closeExperienceModal = () => {
    setExpModalOpen(false);
    setExpSaving(false);
    setExpModalError('');
  };

  const handleExperienceSubmit = async (e) => {
    e.preventDefault();
    if (expSaving) return;

    if (!expForm.company.trim()) {
      setExpModalError('Company name is required.');
      return;
    }
    if (!expForm.role.trim()) {
      setExpModalError('Role title is required.');
      return;
    }

    setExpSaving(true);
    setExpModalError('');

    const achievements = expForm.achievementsInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      company: expForm.company.trim(),
      role: expForm.role.trim(),
      period: expForm.period.trim(),
      location: expForm.location.trim(),
      type: expForm.type || 'Full-time',
      achievements
    };

    try {
      let res;
      if (editingExpId) {
        res = await api.updateExperience(editingExpId, payload);
      } else {
        res = await api.addExperience(payload);
      }

      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to save experience.');
      }

      await refreshData();
      closeExperienceModal();
      setSuccessMessage(editingExpId ? 'Experience updated successfully.' : 'Experience added successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setExpModalError(err.message || 'Failed to save experience.');
    } finally {
      setExpSaving(false);
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experience record?')) return;
    try {
      const res = await api.deleteExperience(id);
      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to delete experience.');
      }
      await refreshData();
      setSuccessMessage('Experience record deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete experience.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // --- Education Handlers ---
  const openNewEducationModal = () => {
    setEditingEduId(null);
    setEduModalError('');
    setEduSaving(false);
    setEduForm({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      period: '',
      location: '',
      gradeGpa: '',
      description: ''
    });
    setEduModalOpen(true);
  };

  const openEditEducationModal = (item) => {
    setEditingEduId(item.id);
    setEduModalError('');
    setEduSaving(false);
    setEduForm({
      institution: item.institution || '',
      degree: item.degree || '',
      fieldOfStudy: item.fieldOfStudy || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      period: item.period || '',
      location: item.location || '',
      gradeGpa: item.gradeGpa || '',
      description: item.description || ''
    });
    setEduModalOpen(true);
  };

  const closeEducationModal = () => {
    setEduModalOpen(false);
    setEduSaving(false);
    setEduModalError('');
  };

  const handleEducationSubmit = async (e) => {
    e.preventDefault();
    if (eduSaving) return;

    if (!eduForm.institution.trim()) {
      setEduModalError('Institution name is required.');
      return;
    }
    if (!eduForm.degree.trim()) {
      setEduModalError('Degree / qualification is required.');
      return;
    }
    if (!eduForm.fieldOfStudy.trim()) {
      setEduModalError('Field of study is required.');
      return;
    }

    setEduSaving(true);
    setEduModalError('');

    // Compute period string if not explicitly entered but start/end are provided
    let computedPeriod = eduForm.period.trim();
    if (!computedPeriod && (eduForm.startDate || eduForm.endDate)) {
      computedPeriod = `${eduForm.startDate.trim()} - ${eduForm.endDate.trim() || 'Present'}`;
    }

    const payload = {
      institution: eduForm.institution.trim(),
      degree: eduForm.degree.trim(),
      fieldOfStudy: eduForm.fieldOfStudy.trim(),
      startDate: eduForm.startDate.trim(),
      endDate: eduForm.endDate.trim(),
      period: computedPeriod,
      location: eduForm.location.trim(),
      gradeGpa: eduForm.gradeGpa.trim(),
      description: eduForm.description.trim()
    };

    try {
      let res;
      if (editingEduId) {
        res = await api.updateEducation(editingEduId, payload);
      } else {
        res = await api.addEducation(payload);
      }

      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to save education record.');
      }

      await refreshData();
      closeEducationModal();
      setSuccessMessage(editingEduId ? 'Education updated successfully.' : 'Education record added successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setEduModalError(err.message || 'Failed to save education record.');
    } finally {
      setEduSaving(false);
    }
  };

  const handleDeleteEducation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this education record?')) return;
    try {
      const res = await api.deleteEducation(id);
      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to delete education record.');
      }
      await refreshData();
      setSuccessMessage('Education record deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete education record.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Experience & Education Management</h2>
          <p className="text-xs text-slate-400">Manage career work history and academic qualifications for the active portfolio.</p>
        </div>
        <div>
          {activeTab === 'experience' ? (
            <button
              onClick={openNewExperienceModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-emerald-950/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Work Role</span>
            </button>
          ) : (
            <button
              onClick={openNewEducationModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-emerald-950/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between" role="status">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-400/60 hover:text-emerald-400" aria-label="Dismiss notification">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between" role="alert">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-400/60 hover:text-rose-400" aria-label="Dismiss alert">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex border-b border-slate-800" role="tablist" aria-label="Experience and Education Tabs">
        <button
          role="tab"
          aria-selected={activeTab === 'experience'}
          onClick={() => setActiveTab('experience')}
          className={`px-5 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'experience'
              ? 'border-emerald-500 text-white bg-slate-800/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Work Experience</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {experience.length}
          </span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'education'}
          onClick={() => setActiveTab('education')}
          className={`px-5 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'education'
              ? 'border-emerald-500 text-white bg-slate-800/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Education</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {education.length}
          </span>
        </button>
      </div>

      {/* WORK EXPERIENCE TAB */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          {experience.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#121723] border border-slate-800/80">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">No work experience roles found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add your career work history, companies, and achievements to display them on your portfolio.
              </p>
              <button
                onClick={openNewExperienceModal}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Experience</span>
              </button>
            </div>
          ) : (
            experience.map((exp, idx) => (
              <div
                key={exp.id || idx}
                className="p-5 rounded-2xl bg-[#121723] border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row justify-between items-start gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-base">{exp.role}</span>
                    <span className="text-xs text-emerald-400 font-medium">@ {exp.company}</span>
                    {exp.type && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {exp.type}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                    {exp.period && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{exp.period}</span>
                      </span>
                    )}
                    {exp.location && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{exp.location}</span>
                      </span>
                    )}
                  </div>

                  {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                    <ul className="mt-2 space-y-1 pl-4 list-disc text-xs text-slate-300">
                      {exp.achievements.map((ach, achIdx) => (
                        <li key={achIdx} className="leading-relaxed">{ach}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => openEditExperienceModal(exp)}
                    aria-label={`Edit ${exp.role} at ${exp.company}`}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteExperience(exp.id)}
                    aria-label={`Delete ${exp.role} at ${exp.company}`}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* EDUCATION TAB */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          {education.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#121723] border border-slate-800/80">
              <GraduationCap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">No education records found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add your degrees, universities, academic achievements, and certifications to your portfolio.
              </p>
              <button
                onClick={openNewEducationModal}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Education Record</span>
              </button>
            </div>
          ) : (
            education.map((edu, idx) => (
              <div
                key={edu.id || idx}
                className="p-5 rounded-2xl bg-[#121723] border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row justify-between items-start gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-base">{edu.degree}</span>
                    {edu.fieldOfStudy && (
                      <span className="text-xs text-slate-300 font-medium">in {edu.fieldOfStudy}</span>
                    )}
                    <span className="text-xs text-emerald-400 font-semibold">• {edu.institution}</span>
                    {edu.gradeGpa && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>{edu.gradeGpa}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                    {(edu.period || edu.startDate || edu.endDate) && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{edu.period || `${edu.startDate || ''} - ${edu.endDate || ''}`}</span>
                      </span>
                    )}
                    {edu.location && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{edu.location}</span>
                      </span>
                    )}
                  </div>

                  {edu.description && (
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mt-1">
                      {edu.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => openEditEducationModal(edu)}
                    aria-label={`Edit ${edu.degree} at ${edu.institution}`}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEducation(edu.id)}
                    aria-label={`Delete ${edu.degree} at ${edu.institution}`}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* WORK EXPERIENCE MODAL */}
      {expModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exp-modal-title"
        >
          <div className="w-full max-w-xl rounded-2xl bg-[#0e131f] border border-slate-800 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 id="exp-modal-title" className="text-base font-bold text-white flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>{editingExpId ? 'Edit Work Role' : 'Add New Work Role'}</span>
              </h3>
              <button
                onClick={closeExperienceModal}
                disabled={expSaving}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {expModalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{expModalError}</span>
              </div>
            )}

            <form onSubmit={handleExperienceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="exp-company" className="text-xs font-medium text-slate-300">Company Name *</label>
                  <input
                    id="exp-company"
                    type="text"
                    required
                    placeholder="e.g. Acme Tech Corp"
                    value={expForm.company}
                    onChange={(e) => setExpForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="exp-role" className="text-xs font-medium text-slate-300">Role Title *</label>
                  <input
                    id="exp-role"
                    type="text"
                    required
                    placeholder="e.g. Senior Java Backend Developer"
                    value={expForm.role}
                    onChange={(e) => setExpForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="exp-period" className="text-xs font-medium text-slate-300">Time Period</label>
                  <input
                    id="exp-period"
                    type="text"
                    placeholder="2024 - Present"
                    value={expForm.period}
                    onChange={(e) => setExpForm(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="exp-location" className="text-xs font-medium text-slate-300">Location</label>
                  <input
                    id="exp-location"
                    type="text"
                    placeholder="e.g. Hyderabad, India"
                    value={expForm.location}
                    onChange={(e) => setExpForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="exp-type" className="text-xs font-medium text-slate-300">Employment Type</label>
                  <select
                    id="exp-type"
                    value={expForm.type}
                    onChange={(e) => setExpForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="exp-achievements" className="text-xs font-medium text-slate-300">Achievements / Bullet Points (one per line)</label>
                <textarea
                  id="exp-achievements"
                  rows={4}
                  placeholder="Architected 8+ Spring Boot microservices handling over 2M daily requests.&#10;Reduced SQL query execution times by 45% with indexing and Redis caching."
                  value={expForm.achievementsInput}
                  onChange={(e) => setExpForm(prev => ({ ...prev, achievementsInput: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none font-mono"
                />
              </div>

              <div className="flex justify-end items-center space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeExperienceModal}
                  disabled={expSaving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-emerald-950/20"
                >
                  {expSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingExpId ? 'Save Changes' : 'Add Experience'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDUCATION MODAL */}
      {eduModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edu-modal-title"
        >
          <div className="w-full max-w-xl rounded-2xl bg-[#0e131f] border border-slate-800 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 id="edu-modal-title" className="text-base font-bold text-white flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>{editingEduId ? 'Edit Education Record' : 'Add Education Record'}</span>
              </h3>
              <button
                onClick={closeEducationModal}
                disabled={eduSaving}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {eduModalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{eduModalError}</span>
              </div>
            )}

            <form onSubmit={handleEducationSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="edu-institution" className="text-xs font-medium text-slate-300">Institution Name *</label>
                <input
                  id="edu-institution"
                  type="text"
                  required
                  placeholder="e.g. Jawaharlal Nehru Technological University"
                  value={eduForm.institution}
                  onChange={(e) => setEduForm(prev => ({ ...prev, institution: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="edu-degree" className="text-xs font-medium text-slate-300">Degree / Qualification *</label>
                  <input
                    id="edu-degree"
                    type="text"
                    required
                    placeholder="e.g. Bachelor of Technology"
                    value={eduForm.degree}
                    onChange={(e) => setEduForm(prev => ({ ...prev, degree: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edu-field" className="text-xs font-medium text-slate-300">Field of Study *</label>
                  <input
                    id="edu-field"
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={eduForm.fieldOfStudy}
                    onChange={(e) => setEduForm(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="edu-start-date" className="text-xs font-medium text-slate-300">Start Date</label>
                  <input
                    id="edu-start-date"
                    type="text"
                    placeholder="e.g. 2019 or Aug 2019"
                    value={eduForm.startDate}
                    onChange={(e) => setEduForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edu-end-date" className="text-xs font-medium text-slate-300">End Date</label>
                  <input
                    id="edu-end-date"
                    type="text"
                    placeholder="e.g. 2023 or May 2023"
                    value={eduForm.endDate}
                    onChange={(e) => setEduForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edu-period" className="text-xs font-medium text-slate-300">Time Period / Years</label>
                  <input
                    id="edu-period"
                    type="text"
                    placeholder="e.g. 2019 - 2023"
                    value={eduForm.period}
                    onChange={(e) => setEduForm(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="edu-location" className="text-xs font-medium text-slate-300">Location</label>
                  <input
                    id="edu-location"
                    type="text"
                    placeholder="e.g. Hyderabad, India"
                    value={eduForm.location}
                    onChange={(e) => setEduForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edu-grade" className="text-xs font-medium text-slate-300">Grade / GPA</label>
                  <input
                    id="edu-grade"
                    type="text"
                    placeholder="e.g. 8.4 / 10 CGPA or First Class"
                    value={eduForm.gradeGpa}
                    onChange={(e) => setEduForm(prev => ({ ...prev, gradeGpa: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="edu-description" className="text-xs font-medium text-slate-300">Description / Achievements</label>
                <textarea
                  id="edu-description"
                  rows={3}
                  placeholder="Relevant Coursework: Data Structures & Algorithms, Database Systems, Cloud Computing, Distributed Systems.&#10;Final Year Project: Microservices Architecture with Spring Boot."
                  value={eduForm.description}
                  onChange={(e) => setEduForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end items-center space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeEducationModal}
                  disabled={eduSaving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={eduSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-emerald-950/20"
                >
                  {eduSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingEduId ? 'Save Changes' : 'Save Education'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
