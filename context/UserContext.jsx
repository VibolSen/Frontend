
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const userId = storedUser ? JSON.parse(storedUser).id : null;
      
      const userData = await apiClient.get(`/auth/me${userId ? `?userId=${userId}` : ''}`);
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      // Don't log expected 401 errors
      if (error.response?.status !== 401) {
        console.error("Failed to fetch user:", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchUser();
  }, [fetchUser]); 

  const updateUser = (newUser) => {
    setUser(newUser);
  };

  return (
    <UserContext.Provider value={{ user, loading, updateUser, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
