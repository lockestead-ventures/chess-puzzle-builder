import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Check for existing user session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('chessPuzzleUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('chessPuzzleUser');
      }
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user);
      localStorage.setItem('chessPuzzleUser', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      localStorage.setItem('chessPuzzleUser', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chessPuzzleUser');
  };

  const updateUserStats = (stats) => {
    if (user) {
      const updatedUser = { ...user, stats: { ...user.stats, ...stats } };
      setUser(updatedUser);
      localStorage.setItem('chessPuzzleUser', JSON.stringify(updatedUser));
    }
  };

  const updateUserPreferences = async (preferences) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const response = await fetch(`/api/auth/user/${user.id}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update preferences');
      }

      const updatedUser = { ...user, preferences: data.preferences };
      setUser(updatedUser);
      localStorage.setItem('chessPuzzleUser', JSON.stringify(updatedUser));
      return { success: true, preferences: data.preferences };
    } catch (error) {
      console.error('Update preferences error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateUserStats,
    updateUserPreferences,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 