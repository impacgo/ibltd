import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    try {
      const userData = localStorage.getItem('ironboy_user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user state when localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'ironboy_user') {
        try {
          if (e.newValue) {
            setUser(JSON.parse(e.newValue));
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ironboy_user');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_type');
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};