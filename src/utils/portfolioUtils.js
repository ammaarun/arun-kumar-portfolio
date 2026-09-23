export const calculatePortfolioCompletion = (portfolioData, clientObj = null) => {
  const info = portfolioData?.personalInfo || {};
  const skills = portfolioData?.skills || [];
  const projects = portfolioData?.projects || [];
  const experience = portfolioData?.experience || [];
  const education = portfolioData?.education || [];
  const services = portfolioData?.services || [];
  const testimonials = portfolioData?.testimonials || [];
  const profileImg = clientObj?.profileImage || info.image || info.profileImage;

  const totalSkillsCount = skills.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);

  const checklist = [
    {
      key: 'profile',
      label: 'Profile Information (Name, Role, Location)',
      completed: !!(info.name && info.role && info.location),
      tabId: 'profile'
    },
    {
      key: 'profileImage',
      label: 'Profile Photo / Avatar Image',
      completed: !!(profileImg && !profileImg.includes('placeholder')),
      tabId: 'profile'
    },
    {
      key: 'about',
      label: 'About Section & Detailed Narrative Bio',
      completed: !!(info.bio && info.bio.length > 30),
      tabId: 'profile'
    },
    {
      key: 'skills',
      label: 'Core Skills & Categorized Tech Stack',
      completed: totalSkillsCount >= 3,
      tabId: 'skills'
    },
    {
      key: 'projects',
      label: 'Portfolio Projects Showcase',
      completed: projects.length >= 1,
      tabId: 'projects'
    },
    {
      key: 'experience',
      label: 'Work Experience History',
      completed: experience.length >= 1,
      tabId: 'experience'
    },
    {
      key: 'education',
      label: 'Education & Academic Degree',
      completed: education.length >= 1,
      tabId: 'experience'
    },
    {
      key: 'services',
      label: 'Freelance Services / Offerings',
      completed: services.length >= 1,
      tabId: 'services'
    },
    {
      key: 'testimonials',
      label: 'Client Testimonials / Endorsements',
      completed: testimonials.some(t => t.visible !== false),
      tabId: 'testimonials'
    },
    {
      key: 'contact',
      label: 'Contact Info (Email & Phone)',
      completed: !!(info.email && info.phone),
      tabId: 'profile'
    },
    {
      key: 'socials',
      label: 'Social Profiles (GitHub & LinkedIn)',
      completed: !!(info.github && info.linkedin && info.github !== '#' && info.linkedin !== '#'),
      tabId: 'profile'
    },
    {
      key: 'resume',
      label: 'Downloadable Resume PDF Link',
      completed: !!(info.resumeUrl && info.resumeUrl !== '#'),
      tabId: 'settings'
    }
  ];

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return {
    percentage,
    completedCount,
    totalCount,
    items: checklist
  };
};
