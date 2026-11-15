import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataContext } from '../context/DataContext';
import { ProjectsView } from '../admin/views/ProjectsView';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    addProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  }
}));

// Mock MediaPickerModal
vi.mock('../admin/components/MediaPickerModal', () => ({
  MediaPickerModal: () => <div data-testid="media-picker-mock" />
}));

describe('ProjectsView Component Tests', () => {
  const mockRefreshData = vi.fn();

  const mockContextValue = {
    data: {
      projects: [
        {
          id: 'proj-1',
          title: 'Existing Cloud Microservices',
          category: 'Backend & Microservices',
          description: 'High throughput distributed backend architecture',
          tech: ['Java', 'Spring Boot', 'Kafka'],
          featured: true
        }
      ]
    },
    loading: false,
    error: null,
    refreshData: mockRefreshData
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <DataContext.Provider value={mockContextValue}>
        <ProjectsView />
      </DataContext.Provider>
    );

  it('1. Clicking "Add New Project" opens modal with enabled "Save Project" button (never stuck in "Saving...")', () => {
    renderComponent();

    const addBtn = screen.getByRole('button', { name: /Add New Project/i });
    fireEvent.click(addBtn);

    // Modal is open
    expect(screen.getByRole('heading', { name: /Add New Project/i })).toBeInTheDocument();

    // Verify "Save Project" button exists and is NOT disabled
    const saveBtn = screen.getByRole('button', { name: /Save Project/i });
    expect(saveBtn).toBeInTheDocument();
    expect(saveBtn).not.toBeDisabled();
    expect(screen.queryByText(/Saving\.\.\./i)).not.toBeInTheDocument();
  });

  it('2. Submitting valid project calls api.addProject, closes modal, and resets loading state', async () => {
    api.addProject.mockResolvedValueOnce({
      success: true,
      data: { id: 'proj-new', title: 'New Test Project' }
    });
    mockRefreshData.mockResolvedValueOnce();

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Add New Project/i }));

    // Fill form
    fireEvent.change(screen.getByLabelText(/Project Title \*/i), {
      target: { value: 'New Test Project' }
    });
    fireEvent.change(screen.getByLabelText(/Short Card Description \*/i), {
      target: { value: 'A powerful new fullstack system' }
    });

    const saveBtn = screen.getByRole('button', { name: /Save Project/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.addProject).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Project',
          description: 'A powerful new fullstack system',
        })
      );
      expect(mockRefreshData).toHaveBeenCalled();
    });

    // Modal closed
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Add New Project/i })).not.toBeInTheDocument();
    });

    // Success banner visible
    expect(screen.getByText(/Project added successfully\./i)).toBeInTheDocument();
  });

  it('3. Resets loading state in finally block and displays error notification if API fails', async () => {
    api.addProject.mockResolvedValueOnce({
      success: false,
      message: 'Database storage quota exceeded.'
    });

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Add New Project/i }));

    fireEvent.change(screen.getByLabelText(/Project Title \*/i), {
      target: { value: 'Failing Project' }
    });
    fireEvent.change(screen.getByLabelText(/Short Card Description \*/i), {
      target: { value: 'Description text' }
    });

    const saveBtn = screen.getByRole('button', { name: /Save Project/i });
    fireEvent.click(saveBtn);

    // Modal error banner is displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Database storage quota exceeded.');
    });

    // Button reverts from "Saving..." back to "Save Project" and is re-enabled
    const reEnabledBtn = screen.getByRole('button', { name: /Save Project/i });
    expect(reEnabledBtn).toBeInTheDocument();
    expect(reEnabledBtn).not.toBeDisabled();
  });

  it('4. Prevents duplicate submissions when saving is in progress', async () => {
    let resolveApiCall;
    api.addProject.mockImplementationOnce(() => new Promise((resolve) => {
      resolveApiCall = resolve;
    }));

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Add New Project/i }));

    fireEvent.change(screen.getByLabelText(/Project Title \*/i), {
      target: { value: 'Duplicate Check Project' }
    });
    fireEvent.change(screen.getByLabelText(/Short Card Description \*/i), {
      target: { value: 'Short Description' }
    });

    const saveBtn = screen.getByRole('button', { name: /Save Project/i });
    
    // First submit
    fireEvent.click(saveBtn);

    // Button should now be disabled and show "Saving..."
    expect(screen.getByText(/Saving\.\.\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Saving\.\.\./i })).toBeDisabled();

    // Second click attempt while saving
    fireEvent.click(screen.getByRole('button', { name: /Saving\.\.\./i }));
    expect(api.addProject).toHaveBeenCalledTimes(1);

    // Resolve the first call
    resolveApiCall({ success: true, data: { id: 'proj-done' } });
    mockRefreshData.mockResolvedValueOnce();

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Add New Project/i })).not.toBeInTheDocument();
    });
  });

  it('5. Canceling or re-opening modal always guarantees fresh enabled Save Project button', () => {
    renderComponent();

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Add New Project/i }));
    expect(screen.getByRole('button', { name: /Save Project/i })).toBeInTheDocument();

    // Click Cancel
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByRole('heading', { name: /Add New Project/i })).not.toBeInTheDocument();

    // Re-open modal
    fireEvent.click(screen.getByRole('button', { name: /Add New Project/i }));
    const newSaveBtn = screen.getByRole('button', { name: /Save Project/i });
    expect(newSaveBtn).toBeInTheDocument();
    expect(newSaveBtn).not.toBeDisabled();
    expect(screen.queryByText(/Saving\.\.\./i)).not.toBeInTheDocument();
  });
});
