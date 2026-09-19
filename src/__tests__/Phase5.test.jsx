import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlogPostView } from '../components/BlogPostView';
import { DataProvider } from '../context/DataContext';
import { api } from '../services/api';

const mockPortfolioResponse = {
  success: true,
  data: {
    personalInfo: { name: 'Arun Kumar', role: 'Java Developer' },
    blogs: [
      {
        id: 'b1',
        slug: 'spring-boot-3-microservices-guide',
        title: 'Spring Boot 3 Microservices Guide',
        excerpt: 'Comprehensive architectural guide to building microservices with Spring Boot 3.',
        content: 'In this article we cover Spring Boot 3, Kafka event streaming, and resilience pattern design.',
        publishedDate: '2026-09-15',
        tags: ['Java', 'Spring Boot', 'Microservices'],
        status: 'Published'
      }
    ]
  }
};

const renderWithContext = (initialEntries = ['/blog/spring-boot-3-microservices-guide']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <DataProvider>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostView />} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </DataProvider>
    </MemoryRouter>
  );
};

describe('Phase 5: Blog Article Detail & Dynamic Routing Tests', () => {

  beforeEach(() => {
    vi.spyOn(api, 'getPortfolio').mockResolvedValue(mockPortfolioResponse);
  });

  it('1. BlogPostView — should render article title, excerpt, and content for valid slug', async () => {
    renderWithContext(['/blog/spring-boot-3-microservices-guide']);

    await waitFor(() => {
      expect(screen.getByText('Spring Boot 3 Microservices Guide')).toBeInTheDocument();
      expect(screen.getByText(/"Comprehensive architectural guide to building microservices/i)).toBeInTheDocument();
      expect(screen.getByText(/In this article we cover Spring Boot 3/i)).toBeInTheDocument();
      expect(screen.getByText('Java')).toBeInTheDocument();
      expect(screen.getByText('Spring Boot')).toBeInTheDocument();
    });
  });

  it('2. BlogPostView — should display "Article Not Found" for invalid slug', async () => {
    renderWithContext(['/blog/non-existent-article-slug']);

    await waitFor(() => {
      expect(screen.getByText('Article Not Found')).toBeInTheDocument();
      expect(screen.getByText(/Return to Portfolio/i)).toBeInTheDocument();
    });
  });

});
