import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('library_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('library_jwt_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('library_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (usernameOrEmail, password) => {
    const response = await api.post('/auth/login', { usernameOrEmail, password });
    const { token: jwtToken, ...userData } = response.data.data;
    
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('library_jwt_token', jwtToken);
    localStorage.setItem('library_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (registerData) => {
    const response = await api.post('/auth/register', registerData);
    const { token: jwtToken, ...userData } = response.data.data;

    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('library_jwt_token', jwtToken);
    localStorage.setItem('library_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('library_jwt_token');
    localStorage.removeItem('library_user');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isLibrarian = user?.role === 'ROLE_LIBRARIAN';
  const isMember = user?.role === 'ROLE_MEMBER';
  const canManageBooks = isAdmin || isLibrarian;
  const canManageMembers = isAdmin || isLibrarian;
  const canManageCirculation = isAdmin || isLibrarian;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        isAdmin,
        isLibrarian,
        isMember,
        canManageBooks,
        canManageMembers,
        canManageCirculation,
      }}
    >
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
