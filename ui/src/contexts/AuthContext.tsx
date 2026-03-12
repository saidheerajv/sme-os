import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { Organization } from '../types/organization.types';
import { organizationsApi } from '../services/organizations.api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  currentOrganization: Organization | null;
  organizations: Organization[];
  setCurrentOrganization: (org: Organization | null) => void;
  refreshOrganizations: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, organizationName: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize user from localStorage
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logout function - defined early for use in interceptor
  const performLogout = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentOrganizationId');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['x-organization-id'];
    setUser(null);
    setCurrentOrganizationState(null);
    setOrganizations([]);
    setError(null);
  };

  // Setup axios interceptor for 401 handling
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          performLogout();
          // Redirect to login page
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  // Configure axios with auth token and load organizations on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Load organizations (user is already restored from localStorage state initializer)
      loadUserSession();
    } else if (token && !storedUser) {
      // Token exists but no user - invalid state, clear everything
      performLogout();
    }
  }, []);

  // Update axios with current organization ID
  useEffect(() => {
    if (currentOrganization) {
      axios.defaults.headers.common['x-organization-id'] = currentOrganization.id;
      localStorage.setItem('currentOrganizationId', currentOrganization.id);
    } else {
      delete axios.defaults.headers.common['x-organization-id'];
      localStorage.removeItem('currentOrganizationId');
    }
  }, [currentOrganization]);

  const loadUserSession = async () => {
    try {
      // Load organizations
      const orgs = await organizationsApi.getAll();
      setOrganizations(orgs);

      // Restore current organization from localStorage or use first one
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      if (savedOrgId) {
        const savedOrg = orgs.find(o => o.id === savedOrgId);
        if (savedOrg) {
          setCurrentOrganizationState(savedOrg);
        } else if (orgs.length > 0) {
          setCurrentOrganizationState(orgs[0]);
        }
      } else if (orgs.length > 0) {
        setCurrentOrganizationState(orgs[0]);
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
    }
  };

  const refreshOrganizations = async () => {
    try {
      const orgs = await organizationsApi.getAll();
      setOrganizations(orgs);
      
      // Update current org if it's been modified
      if (currentOrganization) {
        const updated = orgs.find(o => o.id === currentOrganization.id);
        if (updated) {
          setCurrentOrganizationState(updated);
        } else if (orgs.length > 0) {
          setCurrentOrganizationState(orgs[0]);
        }
      }
    } catch (err) {
      console.error('Failed to refresh organizations:', err);
    }
  };

  const setCurrentOrganization = (org: Organization | null) => {
    setCurrentOrganizationState(org);
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });
      
      const { user, accessToken } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser(user);

      // Load organizations after login
      await loadUserSession();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, organizationName: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/auth/signup', {
        email,
        password,
        name,
        organizationName,
      });
      
      const { user, accessToken, defaultOrganization } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser(user);

      // Set default organization from signup response
      if (defaultOrganization) {
        setOrganizations([defaultOrganization]);
        setCurrentOrganizationState(defaultOrganization);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    performLogout();
  };

  const value = {
    user,
    currentOrganization,
    organizations,
    setCurrentOrganization,
    refreshOrganizations,
    login,
    signup,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};