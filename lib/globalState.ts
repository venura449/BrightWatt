import { User } from './api';

// Global state management utilities
export const globalState = {
  // Token management
  getToken: (): string | null => {
    return global.token || null;
  },
  
  setToken: (token: string | null): void => {
    global.token = token;
  },
  
  clearToken: (): void => {
    global.token = null;
  },
  
  // User management
  getUser: (): User | null => {
    return global.user || null;
  },
  
  setUser: (user: User | null): void => {
    global.user = user;
  },
  
  clearUser: (): void => {
    global.user = null;
  },
  
  // Authentication state
  isAuthenticated: (): boolean => {
    return !!(global.token && global.user);
  },
  
  // Clear all global state (logout)
  clearAll: (): void => {
    global.token = null;
    global.user = null;
    global.isAuthenticated = false;
    global.currentLesson = null;
  },
  
  // Initialize global state
  initialize: (): void => {
    if (typeof global.token === 'undefined') global.token = null;
    if (typeof global.user === 'undefined') global.user = null;
    if (typeof global.isAuthenticated === 'undefined') global.isAuthenticated = false;
    if (typeof global.currentLesson === 'undefined') global.currentLesson = null;
  }
};

// Initialize global state when this module is imported
globalState.initialize();

