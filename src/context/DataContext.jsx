import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { portfolioData as fallbackData } from '../data/portfolioData';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolioData = async (overrideSlug = null) => {
    try {
      setLoading(true);
      setError(null);

      const pathname = typeof window !== 'undefined' && window.location ? window.location.pathname : '';
      const match = pathname.match(/^\/portfolio\/([^/]+)/);
      const slug = overrideSlug || (match ? match[1] : null);

      let res;
      if (slug) {
        res = await api.getPortfolioBySlug(slug);
      } else {
        res = await api.getPortfolio();
      }

      if (res.success && res.data) {
        setData(res.data);
        setError(null);
      } else {
        setError(res.message || 'Portfolio not found');
        setData(null);
      }
    } catch (err) {
      console.warn('Backend server connection issue or portfolio not found:', err);
      setError(err.message || 'Failed to fetch portfolio');
      if (typeof window !== 'undefined' && window.location && !window.location.pathname.startsWith('/portfolio/')) {
        setData(fallbackData);
      } else {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();

    const handleLocationChange = () => {
      fetchPortfolioData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleLocationChange);
      return () => window.removeEventListener('popstate', handleLocationChange);
    }
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error, refreshData: fetchPortfolioData, refetchData: fetchPortfolioData, setData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
