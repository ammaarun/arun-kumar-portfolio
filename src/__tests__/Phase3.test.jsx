import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataProvider } from '../context/DataContext';
import { Services } from '../components/Services';
import { Blog } from '../components/Blog';
import { Testimonials } from '../components/Testimonials';
import { api } from '../services/api';
import { portfolioData } from '../data/portfolioData';

// Mock API data to isolate component testing
const mockPortfolioResponse = {
  success: true,
  data: {
    ...portfolioData,
    services: [
      {
        id: "srv-1",
        title: "Java Backend Development",
        description: "Architecting high-throughput REST APIs and Spring Boot microservices.",
        icon: "Server",
        pricing: "Custom",
        featured: true
      },
      {
        id: "srv-2",
        title: "Full-Stack Web Applications",
        description: "End-to-end web product development.",
        icon: "Layout",
        pricing: "Contract",
        featured: true
      }
    ],
    blogs: [
      {
        id: "post-1",
        title: "Building Resilient Java Microservices with Spring Boot & Kafka",
        excerpt: "A deep dive into distributed transaction management.",
        content: "Detailed content on Java microservices...",
        tags: ["Java", "Spring Boot"],
        publishedDate: "2026-08-15"
      }
    ],
    testimonials: [
      {
        id: "test-1",
        name: "Suresh Reddy",
        role: "Engineering Director",
        company: "Enterprise Tech Solutions",
        content: "Arun is an exceptional Java developer.",
        visible: true
      },
      {
        id: "test-2",
        name: "Priya Sharma",
        role: "Lead Product Manager",
        company: "Innovate Software",
        content: "Arun delivered our portal on time.",
        visible: true
      }
    ]
  }
};

describe('Phase 3: Public Portfolio New Sections Component Tests', () => {

  beforeEach(() => {
    vi.spyOn(api, 'getPortfolio').mockResolvedValue(mockPortfolioResponse);
  });

  it('1. Services Component — should render services grid with titles and descriptions', async () => {
    render(
      <DataProvider>
        <Services />
      </DataProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Specialized Development & Consulting')).toBeInTheDocument();
      expect(screen.getByText('Java Backend Development')).toBeInTheDocument();
      expect(screen.getByText('Full-Stack Web Applications')).toBeInTheDocument();
    });
  });

  it('2. Blog Component — should render article cards and open article reader modal', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <Blog />
        </DataProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering Blog & Writeups')).toBeInTheDocument();
      expect(screen.getByText('Building Resilient Java Microservices with Spring Boot & Kafka')).toBeInTheDocument();
    });

    const readButtons = screen.getAllByText('Read Full Article');
    expect(readButtons[0].closest('a')).toHaveAttribute('href', '/blog/post-1');
  });

  it('3. Testimonials Component — should render client and lead recommendations', async () => {
    render(
      <DataProvider>
        <Testimonials />
      </DataProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Endorsements & Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Suresh Reddy')).toBeInTheDocument();
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    });
  });

});
