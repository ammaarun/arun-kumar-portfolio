import React, { useState, useEffect } from 'react';
import { 
  Palette, Type, Layout, Eye, MoveUp, MoveDown, CheckCircle2, 
  RotateCcw, Save, ShieldCheck, Smartphone, Tablet, Monitor, 
  Sparkles, Layers, Sliders, Check, Clock, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { presetPalettes, generateThemeStyles, defaultDesignConfig } from '../../utils/themeUtils';

export const CustomizeView = () => {
  const { token } = useAuth();
  const { data, refreshData, refetchData } = useData();

  const [activeCategory, setActiveCategory] = useState('colors'); // 'colors' | 'fonts' | 'layout' | 'sections' | 'buttons'
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'

  const [localConfig, setLocalConfig] = useState(null);
  const [savedConfig, setSavedConfig] = useState(null);

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [lastPublishedTime, setLastPublishedTime] = useState(null);

  const iframeRef = React.useRef(null);

  const sendPreviewMessage = () => {
    if (iframeRef.current && iframeRef.current.contentWindow && localConfig) {
      iframeRef.current.contentWindow.postMessage({
        type: 'PREVIEW_DESIGN_CONFIG',
        config: localConfig
      }, '*');
    }
  };

  useEffect(() => {
    sendPreviewMessage();
  }, [localConfig]);

  useEffect(() => {
    const cfg = JSON.parse(JSON.stringify(data?.designConfig || defaultDesignConfig));
    setLocalConfig(cfg);
    setSavedConfig(JSON.parse(JSON.stringify(cfg)));
  }, [data]);

  if (!localConfig) {
    return (
      <div className="py-16 text-center text-slate-400 font-mono text-xs">
        Loading design customizer...
      </div>
    );
  }

  const handleApplyPalette = (palette) => {
    setLocalConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        primary: palette.primary,
        secondary: palette.secondary,
        accent: palette.accent,
        background: palette.background,
        surface: palette.surface,
        text: palette.text
      }
    }));
  };

  const handleColorChange = (key, value) => {
    setLocalConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value
      }
    }));
  };

  const handleFontChange = (type, fontName) => {
    setLocalConfig(prev => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [type]: fontName
      }
    }));
  };

  const handleLayoutChange = (key, value) => {
    setLocalConfig(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [key]: value
      }
    }));
  };

  const handleToggleSectionVisibility = (sectionId) => {
    setLocalConfig(prev => {
      const updatedSections = (prev.sections || []).map(sec => 
        sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
      );
      return { ...prev, sections: updatedSections };
    });
  };

  const handleMoveSection = (index, direction) => {
    setLocalConfig(prev => {
      const sections = [...(prev.sections || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sections.length) return prev;

      const temp = sections[index];
      sections[index] = sections[targetIndex];
      sections[targetIndex] = temp;

      // Re-index order
      const reordered = sections.map((sec, i) => ({ ...sec, order: i + 1 }));
      return { ...prev, sections: reordered };
    });
  };

  const handleResetChanges = () => {
    if (savedConfig) {
      setLocalConfig(JSON.parse(JSON.stringify(savedConfig)));
      setMessage('Unsaved changes reset to last saved state.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/design', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(localConfig)
      });
      const resData = await res.json();
      if (resData.success) {
        setSavedConfig(JSON.parse(JSON.stringify(localConfig)));
        setLastSavedTime(new Date().toLocaleTimeString());
        if (refreshData) await refreshData();
        if (refetchData) await refetchData();
        setMessage('Design changes saved to draft!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(resData.message || 'Failed to save design.');
      }
    } catch (err) {
      console.error('Error saving design:', err);
      setError('Network error saving design.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError('');
    try {
      // First save design config
      await handleSaveChanges();

      // Next update client publication status to PUBLISHED
      const dbRes = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dbData = await dbRes.json();
      const activeId = dbData.activeClientId;

      if (activeId) {
        const pubRes = await fetch(`/api/admin/clients/${activeId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'PUBLISHED' })
        });
        const pubData = await pubRes.json();
        if (pubData.success) {
          setLastPublishedTime(new Date().toLocaleTimeString());
          setMessage('Portfolio published successfully!');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    } catch (err) {
      console.error('Error publishing portfolio:', err);
      setError('Failed to publish portfolio.');
    } finally {
      setPublishing(false);
    }
  };

  const getViewportFrameStyle = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-[375px] h-[640px] rounded-3xl border-8 border-slate-800 shadow-2xl';
      case 'tablet':
        return 'w-[768px] h-[750px] rounded-2xl border-8 border-slate-800 shadow-2xl';
      case 'desktop':
      default:
        return 'w-full h-[750px] rounded-xl border border-slate-800 shadow-xl';
    }
  };

  const previewThemeVars = generateThemeStyles(localConfig);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>PORTFOLIO DESIGN ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Theme & Design Customizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Customize colors, typography, component layouts, and section order with instant real-time live preview.
          </p>
        </div>

        {/* Global Actions Toolbar */}
        <div className="flex items-center space-x-2 shrink-0 flex-wrap">
          <button
            onClick={handleResetChanges}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center space-x-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{publishing ? 'Publishing...' : 'Publish Portfolio'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Main Customizer Workspace (Controls Panel Left, Live Preview Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Controls Panel */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Category Tabs */}
          <div className="flex items-center justify-between bg-[#121723] p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveCategory('colors')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeCategory === 'colors'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Colors</span>
            </button>

            <button
              onClick={() => setActiveCategory('fonts')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeCategory === 'fonts'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Fonts</span>
            </button>

            <button
              onClick={() => setActiveCategory('layout')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeCategory === 'layout'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Layout</span>
            </button>

            <button
              onClick={() => setActiveCategory('sections')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeCategory === 'sections'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sections</span>
            </button>

            <button
              onClick={() => setActiveCategory('buttons')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeCategory === 'buttons'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Style</span>
            </button>
          </div>

          {/* CATEGORY 1: COLORS & THEME MODE */}
          {activeCategory === 'colors' && (
            <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  <span>Theme Mode & Preset Palettes</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Select a base theme mode and curated color palette.</p>
              </div>

              {/* Theme Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300">Theme Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {['dark', 'light', 'system'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setLocalConfig(prev => ({ ...prev, themeMode: mode }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                        localConfig.themeMode === mode
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-[#0a0d14] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palette Presets */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300">Preset Palettes</label>
                <div className="grid grid-cols-2 gap-2">
                  {presetPalettes.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => handleApplyPalette(palette)}
                      className="p-3 rounded-xl bg-[#0a0d14] border border-slate-800 hover:border-slate-700 text-left space-y-2 group transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white">{palette.name}</span>
                        <div className="flex items-center space-x-1">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.primary }} />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.secondary }} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom HEX Colors */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <label className="text-xs font-mono text-slate-300">Custom HEX Colors</label>
                
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Primary Color</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={localConfig.colors?.primary || '#10b981'}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-7 h-7 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localConfig.colors?.primary || '#10b981'}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono bg-[#0a0d14] border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Secondary Accent</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={localConfig.colors?.secondary || '#14b8a6'}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="w-7 h-7 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localConfig.colors?.secondary || '#14b8a6'}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono bg-[#0a0d14] border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Background Color</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={localConfig.colors?.background || '#0a0d14'}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="w-7 h-7 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localConfig.colors?.background || '#0a0d14'}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono bg-[#0a0d14] border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Surface / Card Color</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={localConfig.colors?.surface || '#121723'}
                        onChange={(e) => handleColorChange('surface', e.target.value)}
                        className="w-7 h-7 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localConfig.colors?.surface || '#121723'}
                        onChange={(e) => handleColorChange('surface', e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono bg-[#0a0d14] border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 2: TYPOGRAPHY & FONTS */}
          {activeCategory === 'fonts' && (
            <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Type className="w-4 h-4 text-emerald-400" />
                  <span>Typography & Font Family</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Select typography fonts for headings and body paragraphs.</p>
              </div>

              {/* Heading Font */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300">Heading Font</label>
                <select
                  value={localConfig.fonts?.heading || 'Inter'}
                  onChange={(e) => handleFontChange('heading', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#0a0d14] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="Inter">Inter (Modern & Clean)</option>
                  <option value="Space Grotesk">Space Grotesk (Tech & Techy)</option>
                  <option value="Montserrat">Montserrat (Geometric & Bold)</option>
                  <option value="Poppins">Poppins (Friendly & Rounded)</option>
                  <option value="Playfair Display">Playfair Display (Serif & Elegant)</option>
                  <option value="Roboto">Roboto (Standard & Crisp)</option>
                  <option value="Open Sans">Open Sans (Neutral)</option>
                </select>
              </div>

              {/* Body Font */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300">Body Font</label>
                <select
                  value={localConfig.fonts?.body || 'Inter'}
                  onChange={(e) => handleFontChange('body', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#0a0d14] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="Inter">Inter (Recommended Body)</option>
                  <option value="Roboto">Roboto (Clean Sans)</option>
                  <option value="Open Sans">Open Sans (High Legibility)</option>
                  <option value="Poppins">Poppins (Modern Paragraph)</option>
                  <option value="Space Grotesk">Space Grotesk (Monospace Feel)</option>
                </select>
              </div>
            </div>
          )}

          {/* CATEGORY 3: LAYOUT VARIANTS */}
          {activeCategory === 'layout' && (
            <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Layout className="w-4 h-4 text-emerald-400" />
                  <span>Component Layout Variants</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure layout structures for major portfolio sections.</p>
              </div>

              {/* Hero Layout */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300">Hero Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'centered', label: 'Centered Hero' },
                    { id: 'left', label: 'Left Aligned' },
                    { id: 'split', label: 'Split Grid' },
                    { id: 'image', label: 'Image Focus' }
                  ].map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleLayoutChange('hero', variant.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        localConfig.layout?.hero === variant.id
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-[#0a0d14] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {variant.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Projects Layout */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300">Projects Showcase Layout</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'grid', label: '3-Col Grid' },
                    { id: 'cards', label: 'Cards' },
                    { id: 'featured', label: 'Featured List' }
                  ].map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleLayoutChange('projects', variant.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        localConfig.layout?.projects === variant.id
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-[#0a0d14] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {variant.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Section Layout */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300">Contact Section Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'form', label: 'Contact Form' },
                    { id: 'cards', label: 'Direct Cards' }
                  ].map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleLayoutChange('contact', variant.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        localConfig.layout?.contact === variant.id
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-[#0a0d14] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {variant.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 4: SECTIONS ORDER & VISIBILITY */}
          {activeCategory === 'sections' && (
            <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Section Visibility & Reordering</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Toggle section visibility or reorder section sequence. Hidden sections remain saved in database.
                </p>
              </div>

              <div className="space-y-2">
                {(localConfig.sections || []).map((sec, idx) => (
                  <div
                    key={sec.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      sec.visible !== false
                        ? 'bg-[#0a0d14] border-slate-800 text-slate-200'
                        : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-[10px] text-slate-500 w-4">#{idx + 1}</span>
                      <span className="font-bold text-white">{sec.name}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {/* Move Up Button */}
                      <button
                        onClick={() => handleMoveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down Button */}
                      <button
                        onClick={() => handleMoveSection(idx, 'down')}
                        disabled={idx === (localConfig.sections || []).length - 1}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Visibility Eye Button */}
                      <button
                        onClick={() => handleToggleSectionVisibility(sec.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          sec.visible !== false
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : 'text-slate-500 border-slate-800 bg-slate-900'
                        }`}
                        title={sec.visible !== false ? 'Visible on Site' : 'Hidden from Site'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORY 5: BUTTON STYLES & MOTION */}
          {activeCategory === 'buttons' && (
            <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Button Style & Motion Intensity</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure global CTA button rounding and animation intensity.</p>
              </div>

              {/* Button Style */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300">Button Corner Radius</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'rounded', label: 'Rounded' },
                    { id: 'square', label: 'Square' },
                    { id: 'pill', label: 'Pill / Capsule' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setLocalConfig(prev => ({ ...prev, buttons: { ...prev.buttons, style: style.id } }))}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        localConfig.buttons?.style === style.id
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-[#0a0d14] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Mode */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300">Animation Intensity</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'subtle', label: 'Subtle' },
                    { id: 'standard', label: 'Standard' }
                  ].map((anim) => (
                    <button
                      key={anim.id}
                      onClick={() => setLocalConfig(prev => ({ ...prev, animations: anim.id }))}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        localConfig.animations === anim.id
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-[#0a0d14] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {anim.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Interactive Live Preview Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-[#121723] border border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Interactive Live Preview</span>
            </div>

            {/* Viewport Switcher */}
            <div className="flex items-center space-x-1 bg-[#0a0d14] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  deviceMode === 'mobile' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDeviceMode('tablet')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  deviceMode === 'tablet' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Tablet (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  deviceMode === 'desktop' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop (Full)"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewport Render Frame */}
          <div className="p-4 bg-[#0a0d14] rounded-2xl border border-slate-800 flex items-center justify-center overflow-auto min-h-[750px]">
            <div 
              style={previewThemeVars} 
              className={`transition-all duration-300 bg-white dark:bg-[#0a0d14] overflow-hidden ${getViewportFrameStyle()}`}
            >
              <iframe
                ref={iframeRef}
                onLoad={sendPreviewMessage}
                src="/"
                title="Live Design Preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>

          {/* Timestamps status bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-2">
            <span>Last Saved: {lastSavedTime || 'Not saved in session'}</span>
            <span>Last Published: {lastPublishedTime || 'Draft state'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
