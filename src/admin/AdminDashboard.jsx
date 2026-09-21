import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { OverviewView } from './views/OverviewView';
import { PresetsView } from './views/PresetsView';
import { ProfileView } from './views/ProfileView';
import { SkillsView } from './views/SkillsView';
import { ProjectsView } from './views/ProjectsView';
import { ExperienceView } from './views/ExperienceView';
import { ServicesView } from './views/ServicesView';
import { BlogView } from './views/BlogView';
import { TestimonialsView } from './views/TestimonialsView';
import { MessagesView } from './views/MessagesView';
import { SettingsView } from './views/SettingsView';

export const AdminDashboardPlaceholder = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView setActiveTab={setActiveTab} />;
      case 'presets':
        return <PresetsView setActiveTab={setActiveTab} />;
      case 'profile':
        return <ProfileView />;
      case 'skills':
        return <SkillsView />;
      case 'projects':
        return <ProjectsView />;
      case 'experience':
        return <ExperienceView />;
      case 'services':
        return <ServicesView />;
      case 'blog':
        return <BlogView />;
      case 'testimonials':
        return <TestimonialsView />;
      case 'messages':
        return <MessagesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveView()}
    </AdminLayout>
  );
};
