import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null means not logged in, object means logged in
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on mount
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/current_user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': 'true'
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // Set user if logged in
        } else {
          setUser(null); // Not logged in
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setUser(null); // Assume not logged in on error
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []); // Run only once on component mount

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': 'true'
        },
      });

      if (response.ok) {
        setUser(null); // Clear user state on successful logout
        console.log('Logout successful');
      } else {
        console.error('Logout failed');
        // Optionally handle logout failure, but typically frontend state can be cleared anyway
        setUser(null); 
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Assume logout happened on the backend despite network error and clear frontend state
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 