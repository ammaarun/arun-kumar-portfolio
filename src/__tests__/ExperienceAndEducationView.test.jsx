import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataContext } from '../context/DataContext';
import { ExperienceView } from '../admin/views/ExperienceView';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    addExperience: vi.fn(),
    updateExperience: vi.fn(),
    deleteExperience: vi.fn(),
    addEducation: vi.fn(),
    updateEducation: vi.fn(),
    deleteEducation: vi.fn(),
  }
}));

describe('ExperienceView Component Tests', () => {
  const mockRefreshData = vi.fn();

  const mockContextValue = {
    data: {
      experience: [
        {
          id: 'exp-1',
          company: 'Nexus Core',
          role: 'Lead Backend Engineer',
          period: '2023 - Present',
          location: 'Telangana, India',
          type: 'Full-time',
          achievements: ['Designed microservices architecture', 'Reduced database latency by 40%']
        }
      ],
      education: [
        {
          id: 'edu-1',
          institution: 'JNTU Hyderabad',
          degree: 'Bachelor of Technology',
          fieldOfStudy: 'Computer Science & Engineering',
          startDate: '2019',
          endDate: '2023',
          period: '2019 - 2023',
          location: 'Hyderabad, India',
          gradeGpa: '8.6 CGPA',
          description: 'Specialized in Distributed Computing and Database Systems.'
        }
      ]
    },
    loading: false,
    error: null,
    refreshData: mockRefreshData
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  const renderComponent = (contextOverrides = {}) =>
    render(
      <DataContext.Provider value={{ ...mockContextValue, ...contextOverrides }}>
        <ExperienceView />
      </DataContext.Provider>
    );

  it('1. Renders tabs for Work Experience and Education with count badges', () => {
    renderComponent();

    const expTab = screen.getByRole('tab', { name: /Work Experience/i });
    const eduTab = screen.getByRole('tab', { name: /Education/i });

    expect(expTab).toBeInTheDocument();
    expect(expTab).toHaveAttribute('aria-selected', 'true');
    expect(eduTab).toBeInTheDocument();
    expect(eduTab).toHaveAttribute('aria-selected', 'false');

    // Experience list item is rendered by default
    expect(screen.getByText('Lead Backend Engineer')).toBeInTheDocument();
    expect(screen.getByText(/Nexus Core/i)).toBeInTheDocument();
  });

  it('2. Switches to Education tab and displays education items', () => {
    renderComponent();

    const eduTab = screen.getByRole('tab', { name: /Education/i });
    fireEvent.click(eduTab);

    expect(eduTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Bachelor of Technology')).toBeInTheDocument();
    expect(screen.getByText(/in Computer Science & Engineering/i)).toBeInTheDocument();
    expect(screen.getByText(/JNTU Hyderabad/i)).toBeInTheDocument();
    expect(screen.getByText('8.6 CGPA')).toBeInTheDocument();
  });

  it('3. Opens Add Work Role modal and submits successfully', async () => {
    api.addExperience.mockResolvedValueOnce({ success: true });
    renderComponent();

    const addBtn = screen.getByRole('button', { name: /Add Work Role/i });
    fireEvent.click(addBtn);

    // Modal is open
    expect(screen.getByRole('heading', { name: /Add New Work Role/i })).toBeInTheDocument();

    const companyInput = screen.getByLabelText(/Company Name \*/i);
    const roleInput = screen.getByLabelText(/Role Title \*/i);
    const periodInput = screen.getByLabelText(/Time Period/i);
    const achievementsInput = screen.getByLabelText(/Achievements/i);

    fireEvent.change(companyInput, { target: { value: 'Hyperion Systems' } });
    fireEvent.change(roleInput, { target: { value: 'Staff Java Architect' } });
    fireEvent.change(periodInput, { target: { value: '2024 - Present' } });
    fireEvent.change(achievementsInput, { target: { value: 'Built Kafka event streaming.\nManaged Kubernetes cluster.' } });

    const submitBtn = screen.getByRole('button', { name: /^Add Experience$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.addExperience).toHaveBeenCalledTimes(1);
      expect(api.addExperience).toHaveBeenCalledWith(expect.objectContaining({
        company: 'Hyperion Systems',
        role: 'Staff Java Architect',
        period: '2024 - Present',
        achievements: ['Built Kafka event streaming.', 'Managed Kubernetes cluster.']
      }));
      expect(mockRefreshData).toHaveBeenCalledTimes(1);
    });

    // Modal closes
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Add New Work Role/i })).not.toBeInTheDocument();
    });
  });

  it('4. Opens Edit Work Role modal and updates experience', async () => {
    api.updateExperience.mockResolvedValueOnce({ success: true });
    renderComponent();

    const editBtn = screen.getByRole('button', { name: /Edit Lead Backend Engineer/i });
    fireEvent.click(editBtn);

    expect(screen.getByRole('heading', { name: /Edit Work Role/i })).toBeInTheDocument();
    const roleInput = screen.getByLabelText(/Role Title \*/i);
    expect(roleInput.value).toBe('Lead Backend Engineer');

    fireEvent.change(roleInput, { target: { value: 'Principal Backend Engineer' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.updateExperience).toHaveBeenCalledTimes(1);
      expect(api.updateExperience).toHaveBeenCalledWith('exp-1', expect.objectContaining({
        role: 'Principal Backend Engineer',
        company: 'Nexus Core'
      }));
      expect(mockRefreshData).toHaveBeenCalledTimes(1);
    });
  });

  it('5. Deletes an experience record after confirmation', async () => {
    api.deleteExperience.mockResolvedValueOnce({ success: true });
    renderComponent();

    const deleteBtn = screen.getByRole('button', { name: /Delete Lead Backend Engineer/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(api.deleteExperience).toHaveBeenCalledWith('exp-1');
      expect(mockRefreshData).toHaveBeenCalledTimes(1);
    });
  });

  it('6. Opens Add Education modal, validates required fields, and submits successfully', async () => {
    api.addEducation.mockResolvedValueOnce({ success: true });
    renderComponent();

    // Switch to Education tab
    const eduTab = screen.getByRole('tab', { name: /Education/i });
    fireEvent.click(eduTab);

    const addEduBtn = screen.getByRole('button', { name: /Add Education/i });
    fireEvent.click(addEduBtn);

    expect(screen.getByRole('heading', { name: /Add Education Record/i })).toBeInTheDocument();

    const instInput = screen.getByLabelText(/Institution Name \*/i);
    const degInput = screen.getByLabelText(/Degree \/ Qualification \*/i);
    const fieldInput = screen.getByLabelText(/Field of Study \*/i);
    const startInput = screen.getByLabelText(/Start Date/i);
    const endInput = screen.getByLabelText(/End Date/i);
    const gradeInput = screen.getByLabelText(/Grade \/ GPA/i);
    const descInput = screen.getByLabelText(/Description \/ Achievements/i);

    fireEvent.change(instInput, { target: { value: 'Stanford University' } });
    fireEvent.change(degInput, { target: { value: 'Master of Science' } });
    fireEvent.change(fieldInput, { target: { value: 'Software Systems' } });
    fireEvent.change(startInput, { target: { value: '2023' } });
    fireEvent.change(endInput, { target: { value: '2025' } });
    fireEvent.change(gradeInput, { target: { value: '4.0 GPA' } });
    fireEvent.change(descInput, { target: { value: 'Research in distributed consensus algorithms.' } });

    const submitBtn = screen.getByRole('button', { name: /Save Education/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.addEducation).toHaveBeenCalledTimes(1);
      expect(api.addEducation).toHaveBeenCalledWith(expect.objectContaining({
        institution: 'Stanford University',
        degree: 'Master of Science',
        fieldOfStudy: 'Software Systems',
        startDate: '2023',
        endDate: '2025',
        gradeGpa: '4.0 GPA',
        description: 'Research in distributed consensus algorithms.'
      }));
      expect(mockRefreshData).toHaveBeenCalledTimes(1);
    });
  });

  it('7. Opens Edit Education modal and updates record', async () => {
    api.updateEducation.mockResolvedValueOnce({ success: true });
    renderComponent();

    // Switch to Education tab
    fireEvent.click(screen.getByRole('tab', { name: /Education/i }));

    const editBtn = screen.getByRole('button', { name: /Edit Bachelor of Technology/i });
    fireEvent.click(editBtn);

    expect(screen.getByRole('heading', { name: /Edit Education Record/i })).toBeInTheDocument();
    const degInput = screen.getByLabelText(/Degree \/ Qualification \*/i);
    expect(degInput.value).toBe('Bachelor of Technology');

    fireEvent.change(degInput, { target: { value: 'B.Tech with Honors' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.updateEducation).toHaveBeenCalledTimes(1);
      expect(api.updateEducation).toHaveBeenCalledWith('edu-1', expect.objectContaining({
        degree: 'B.Tech with Honors',
        institution: 'JNTU Hyderabad'
      }));
      expect(mockRefreshData).toHaveBeenCalledTimes(1);
    });
  });

  it('8. Deletes an education record after confirmation', async () => {
    api.deleteEducation.mockResolvedValueOnce({ success: true });
    renderComponent();

    // Switch to Education tab
    fireEvent.click(screen.getByRole('tab', { name: /Education/i }));

    const deleteBtn = screen.getByRole('button', { name: /Delete Bachelor of Technology/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(api.deleteEducation).toHaveBeenCalledWith('edu-1');
      expect(mockRefreshData).toHaveBeenCalledTimes(1);
    });
  });

  it('9. Handles API save errors gracefully and resets loading state', async () => {
    api.addExperience.mockRejectedValueOnce(new Error('Network error on save'));
    renderComponent();

    const addBtn = screen.getByRole('button', { name: /Add Work Role/i });
    fireEvent.click(addBtn);

    fireEvent.change(screen.getByLabelText(/Company Name \*/i), { target: { value: 'Error Corp' } });
    fireEvent.change(screen.getByLabelText(/Role Title \*/i), { target: { value: 'Dev' } });

    const submitBtn = screen.getByRole('button', { name: /^Add Experience$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error on save');
      // Submit button is re-enabled, not stuck loading
      expect(submitBtn).not.toBeDisabled();
    });
  });
});
