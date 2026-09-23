export const visualTemplates = [
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Emerald and dark-theme layout with high-contrast emerald accents, ideal for modern tech stacks.',
    category: 'Developer & SaaS',
    badge: 'Popular',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    tags: ['Dark Theme', 'Emerald Accent', 'Centered Hero', 'Grid Projects'],
    designConfig: {
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
    }
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Clean, light-background minimalist design with crisp blue highlights and card-based project layout.',
    category: 'Minimalist & Clean',
    badge: 'Light Theme',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    tags: ['Light Mode', 'Royal Blue Accent', 'Left Hero', 'Card Projects'],
    designConfig: {
      template: 'minimal-light',
      themeMode: 'light',
      colors: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        accent: '#1d4ed8',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#0f172a'
      },
      fonts: {
        heading: 'Space Grotesk',
        body: 'Inter'
      },
      layout: {
        hero: 'left',
        projects: 'cards',
        navigation: 'top',
        contact: 'cards'
      },
      buttons: {
        style: 'square',
        size: 'medium'
      },
      animations: 'subtle',
      sections: [
        { id: 'hero', name: 'Hero', visible: true, order: 1 },
        { id: 'about', name: 'About', visible: true, order: 2 },
        { id: 'projects', name: 'Projects Showcase', visible: true, order: 3 },
        { id: 'skills', name: 'Skills', visible: true, order: 4 },
        { id: 'experience', name: 'Work Experience', visible: true, order: 5 },
        { id: 'services', name: 'Services', visible: true, order: 6 },
        { id: 'testimonials', name: 'Testimonials', visible: true, order: 7 },
        { id: 'blog', name: 'Blog / Articles', visible: true, order: 8 },
        { id: 'contact', name: 'Contact', visible: true, order: 9 }
      ]
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate slate theme with cyan highlights, split hero layout, and featured project carousel.',
    category: 'Enterprise & Senior',
    badge: 'Corporate',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    tags: ['Slate Dark', 'Cyan Accent', 'Split Hero', 'Featured Projects'],
    designConfig: {
      template: 'professional',
      themeMode: 'dark',
      colors: {
        primary: '#06b6d4',
        secondary: '#0891b2',
        accent: '#0e7490',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f8fafc'
      },
      fonts: {
        heading: 'Montserrat',
        body: 'Roboto'
      },
      layout: {
        hero: 'split',
        projects: 'featured',
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
        { id: 'experience', name: 'Work Experience', visible: true, order: 3 },
        { id: 'projects', name: 'Projects Showcase', visible: true, order: 4 },
        { id: 'skills', name: 'Skills', visible: true, order: 5 },
        { id: 'services', name: 'Services', visible: true, order: 6 },
        { id: 'testimonials', name: 'Testimonials', visible: true, order: 7 },
        { id: 'blog', name: 'Blog / Articles', visible: true, order: 8 },
        { id: 'contact', name: 'Contact', visible: true, order: 9 }
      ]
    }
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant pink and purple gradients with Playfair Display headings, pill buttons, and image-focused hero.',
    category: 'Design & Creative',
    badge: 'Vibrant',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    tags: ['Gradient Dark', 'Fuchsia Accent', 'Image Hero', 'Pill Buttons'],
    designConfig: {
      template: 'creative',
      themeMode: 'dark',
      colors: {
        primary: '#ec4899',
        secondary: '#8b5cf6',
        accent: '#d946ef',
        background: '#111827',
        surface: '#1f2937',
        text: '#f9fafb'
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Poppins'
      },
      layout: {
        hero: 'image',
        projects: 'featured',
        navigation: 'minimal',
        contact: 'form'
      },
      buttons: {
        style: 'pill',
        size: 'large'
      },
      animations: 'standard',
      sections: [
        { id: 'hero', name: 'Hero', visible: true, order: 1 },
        { id: 'about', name: 'About', visible: true, order: 2 },
        { id: 'projects', name: 'Projects Showcase', visible: true, order: 3 },
        { id: 'skills', name: 'Skills', visible: true, order: 4 },
        { id: 'services', name: 'Services', visible: true, order: 5 },
        { id: 'testimonials', name: 'Testimonials', visible: true, order: 6 },
        { id: 'experience', name: 'Work Experience', visible: true, order: 7 },
        { id: 'blog', name: 'Blog / Articles', visible: true, order: 8 },
        { id: 'contact', name: 'Contact', visible: true, order: 9 }
      ]
    }
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Matrix-inspired terminal green style with ultra-dark background, Space Grotesk font, and square buttons.',
    category: 'Engineering & Systems',
    badge: 'Terminal Style',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    tags: ['Terminal Green', 'Pitch Black', 'Left Hero', 'Square Buttons'],
    designConfig: {
      template: 'developer',
      themeMode: 'dark',
      colors: {
        primary: '#22c55e',
        secondary: '#10b981',
        accent: '#15803d',
        background: '#050505',
        surface: '#0d0d0d',
        text: '#e5e5e5'
      },
      fonts: {
        heading: 'Space Grotesk',
        body: 'Roboto'
      },
      layout: {
        hero: 'left',
        projects: 'grid',
        navigation: 'top',
        contact: 'cards'
      },
      buttons: {
        style: 'square',
        size: 'small'
      },
      animations: 'subtle',
      sections: [
        { id: 'hero', name: 'Hero', visible: true, order: 1 },
        { id: 'skills', name: 'Skills', visible: true, order: 2 },
        { id: 'projects', name: 'Projects Showcase', visible: true, order: 3 },
        { id: 'about', name: 'About', visible: true, order: 4 },
        { id: 'experience', name: 'Work Experience', visible: true, order: 5 },
        { id: 'services', name: 'Services', visible: true, order: 6 },
        { id: 'blog', name: 'Blog / Articles', visible: true, order: 7 },
        { id: 'testimonials', name: 'Testimonials', visible: true, order: 8 },
        { id: 'contact', name: 'Contact', visible: true, order: 9 }
      ]
    }
  },
  {
    id: 'designer',
    name: 'Designer',
    description: 'Warm amber and gold accents on zinc dark background with Poppins typography and minimal navigation.',
    category: 'UI/UX & Branding',
    badge: 'Warm Amber',
    thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
    tags: ['Amber Gold', 'Zinc Dark', 'Split Hero', 'Pill Buttons'],
    designConfig: {
      template: 'designer',
      themeMode: 'dark',
      colors: {
        primary: '#f59e0b',
        secondary: '#d97706',
        accent: '#b45309',
        background: '#18181b',
        surface: '#27272a',
        text: '#fafafa'
      },
      fonts: {
        heading: 'Poppins',
        body: 'Open Sans'
      },
      layout: {
        hero: 'split',
        projects: 'cards',
        navigation: 'minimal',
        contact: 'form'
      },
      buttons: {
        style: 'pill',
        size: 'medium'
      },
      animations: 'standard',
      sections: [
        { id: 'hero', name: 'Hero', visible: true, order: 1 },
        { id: 'about', name: 'About', visible: true, order: 2 },
        { id: 'projects', name: 'Projects Showcase', visible: true, order: 3 },
        { id: 'services', name: 'Services', visible: true, order: 4 },
        { id: 'skills', name: 'Skills', visible: true, order: 5 },
        { id: 'testimonials', name: 'Testimonials', visible: true, order: 6 },
        { id: 'experience', name: 'Work Experience', visible: true, order: 7 },
        { id: 'blog', name: 'Blog / Articles', visible: true, order: 8 },
        { id: 'contact', name: 'Contact', visible: true, order: 9 }
      ]
    }
  }
];
