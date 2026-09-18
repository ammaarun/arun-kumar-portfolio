import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { portfolioData as fallbackData } from '../data/portfolioData';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const res = await api.getPortfolio();
      if (res.success && res.data) {
        setData(res.data);
        setError(null);
      }
    } catch (err) {
      console.warn('Backend server connection issue, using fallback data:', err);
      setError('Using cached portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error, refreshData: fetchPortfolioData, setData }}>
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
