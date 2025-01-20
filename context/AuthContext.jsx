import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [minimumLoading, setMinimumLoading] = useState(true);
  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

  // Initialize user data from AsyncStorage when the app loads
  useEffect(() => {
    const loadUserData = async () => {
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        console.log("user is already logged in");
        setUser(JSON.parse(storedUser));
          router.replace('/(tabs)'); // Redirect if user is already logged in
      }else{
        console.log("user is not logged in");
      }
      setLoading(false);
    };
    // setTimeout(() => {
    //   setMinimumLoading(false);
    // }, 2000);
    loadUserData();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/teachers/login`, {
        email,
        password,
      });
      const userData = response.data;
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      router.replace('/(tabs)/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      router.replace('/login');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Update user function
  const updateUser = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Update user failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
