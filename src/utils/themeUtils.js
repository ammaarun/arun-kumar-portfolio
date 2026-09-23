export const defaultDesignConfig = {
  template: 'modern-dark',
  themeMode: 'dark',
  colors: {
    primary: '#10b981',
    secondary: '#14b8a6',
    accent: '#059669',
    background: '#0a0d14',
    surface: '#121723',
    text: '#f1f5f9'
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter'
  },
  layout: {
    hero: 'centered',
    projects: 'grid',
    navigation: 'top',
    contact: 'form'
  },
  buttons: {
    style: 'rounded',
    size: 'medium'
  },
  animations: 'standard',
  sections: [
    { id: 'hero', name: 'Hero', visible: true, order: 1 },
    { id: 'about', name: 'About', visible: true, order: 2 },
    { id: 'skills', name: 'Skills', visible: true, order: 3 },
    { id: 'projects', name: 'Projects Showcase', visible: true, order: 4 },
    { id: 'services', name: 'Services', visible: true, order: 5 },
    { id: 'experience', name: 'Work Experience', visible: true, order: 6 },
    { id: 'blog', name: 'Blog / Articles', visible: true, order: 7 },
    { id: 'testimonials', name: 'Testimonials', visible: true, order: 8 },
    { id: 'contact', name: 'Contact', visible: true, order: 9 }
  ]
};

export const getFontFamily = (fontName) => {
  switch (fontName) {
    case 'Poppins':
      return "'Poppins', sans-serif";
    case 'Roboto':
      return "'Roboto', sans-serif";
    case 'Montserrat':
      return "'Montserrat', sans-serif";
    case 'Open Sans':
      return "'Open Sans', sans-serif";
    case 'Playfair Display':
      return "'Playfair Display', Georgia, serif";
    case 'Space Grotesk':
      return "'Space Grotesk', sans-serif";
    case 'Inter':
    default:
      return "'Inter', system-ui, -apple-system, sans-serif";
  }
};

export const getButtonRadius = (buttonStyle) => {
  switch (buttonStyle) {
    case 'square':
      return '0.25rem';
    case 'pill':
      return '9999px';
    case 'rounded':
    default:
      return '0.75rem';
  }
};

export const generateThemeStyles = (designConfig = {}) => {
  const colors = designConfig.colors || defaultDesignConfig.colors;
  const fonts = designConfig.fonts || defaultDesignConfig.fonts;
  const buttons = designConfig.buttons || defaultDesignConfig.buttons;

  return {
    '--primary-color': colors.primary || '#10b981',
    '--secondary-color': colors.secondary || '#14b8a6',
    '--accent-color': colors.accent || '#059669',
    '--bg-color': colors.background || '#0a0d14',
    '--surface-color': colors.surface || '#121723',
    '--text-color': colors.text || '#f1f5f9',
    '--font-heading': getFontFamily(fonts.heading),
    '--font-body': getFontFamily(fonts.body),
    '--btn-radius': getButtonRadius(buttons.style)
  };
};

export const presetPalettes = [
  {
    name: 'Emerald (Default)',
    id: 'emerald',
    primary: '#10b981',
    secondary: '#14b8a6',
    accent: '#059669',
    background: '#0a0d14',
    surface: '#121723',
    text: '#f1f5f9'
  },
  {
    name: 'Ocean Blue',
    id: 'ocean',
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#1d4ed8',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc'
  },
  {
    name: 'Royal Purple',
    id: 'purple',
    primary: '#8b5cf6',
    secondary: '#a855f7',
    accent: '#7c3aed',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb'
  },
  {
    name: 'Sunset Rose',
    id: 'sunset',
    primary: '#ec4899',
    secondary: '#f43f5e',
    accent: '#db2777',
    background: '#18181b',
    surface: '#27272a',
    text: '#fafafa'
  },
  {
    name: 'Amber Gold',
    id: 'amber',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#b45309',
    background: '#0a0a0a',
    surface: '#171717',
    text: '#f5f5f5'
  },
  {
    name: 'Monochrome Slate',
    id: 'monochrome',
    primary: '#94a3b8',
    secondary: '#64748b',
    accent: '#475569',
    background: '#020617',
    surface: '#0f172a',
    text: '#f8fafc'
  }
];
