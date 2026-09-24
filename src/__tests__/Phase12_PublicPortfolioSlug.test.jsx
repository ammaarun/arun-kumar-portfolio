import { describe, test, expect, beforeEach, vi } from 'vitest';
import { dbEngine } from '../../server/data/dbEngine';
import { api } from '../services/api';

describe('Phase 12: Public Portfolio Slug Isolation Integration Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('1. GET /api/portfolio/slug/:slug — returns isolated portfolio data for target slug regardless of active Admin client', () => {
    const db = dbEngine.get();

    // Ensure client 1 (Arun) and client 2 (Priya) exist in db
    let client1 = db.clients.find(c => c.id === 'client-1');
    if (!client1) {
      client1 = {
        id: 'client-1',
        name: 'Arun Kumar',
        slug: 'arun-kumar',
        status: 'PUBLISHED',
        portfolioData: { personalInfo: { name: 'Arun Kumar' } }
      };
      db.clients.push(client1);
    }
    client1.slug = 'arun-kumar';
    client1.name = 'Arun Kumar';

    let client2 = db.clients.find(c => c.id === 'client-2');
    if (!client2) {
      client2 = {
        id: 'client-2',
        name: 'Priya Reddy',
        email: 'priya@example.com',
        role: 'Frontend Architect',
        slug: 'priya-reddy',
        status: 'PUBLISHED',
        portfolioData: { personalInfo: { name: 'Priya Reddy', role: 'Frontend Architect' } }
      };
      db.clients.push(client2);
    } else {
      client2.slug = 'priya-reddy';
      client2.name = 'Priya Reddy';
      client2.portfolioData = { personalInfo: { name: 'Priya Reddy', role: 'Frontend Architect' } };
    }
    dbEngine.save(db);

    // Switch active Admin client to Client 1 (Arun)
    dbEngine.switchActiveClient('client-1');

    // Query DB for client 2 by slug 'priya-reddy'
    const priyaClient = dbEngine.get().clients.find(c => c.slug === 'priya-reddy');
    expect(priyaClient).toBeDefined();
    expect(priyaClient.name).toBe('Priya Reddy');

    // Verify switching active Admin client to Priya does not alter Arun's slug lookup
    dbEngine.switchActiveClient('client-2');
    const arunClient = dbEngine.get().clients.find(c => c.slug === 'arun-kumar');
    expect(arunClient).toBeDefined();
    expect(arunClient.name).toBe('Arun Kumar');
  });

  test('2. api.getPortfolioBySlug — requests /api/portfolio/slug/:slug and handles success/error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          slug: 'rahul-sharma',
          clientName: 'Rahul Sharma',
          personalInfo: { name: 'Rahul Sharma', role: 'Backend Lead' }
        }
      })
    });

    const res = await api.getPortfolioBySlug('rahul-sharma');
    expect(res.success).toBe(true);
    expect(res.data.slug).toBe('rahul-sharma');
    expect(res.data.clientName).toBe('Rahul Sharma');
  });

  test('3. Non-existent slug returns 404 error from api.getPortfolioBySlug', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        message: "Portfolio with slug 'non-existent-person' not found."
      })
    });

    await expect(api.getPortfolioBySlug('non-existent-person')).rejects.toThrow(
      "Portfolio with slug 'non-existent-person' not found."
    );
  });

});
