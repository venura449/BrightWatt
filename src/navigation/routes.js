// Expo Router navigation configuration with Font Awesome icons
// This file defines the available routes in your app

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  FORGOT_PASSWORD: '/forgot-password'
};

// Route names for easy reference
export const ROUTE_NAMES = {
  HOME: 'Home',
  LOGIN: 'Login',
  REGISTER: 'Register',
  PROFILE: 'Profile',
  FORGOT_PASSWORD: 'ForgotPassword'
};

// Route icons for consistent UI
export const ROUTE_ICONS = {
  HOME: 'bolt',
  LOGIN: 'sign-in',
  REGISTER: 'user-plus',
  PROFILE: 'user',
  FORGOT_PASSWORD: 'key'
};

// Navigation helper functions
export const navigateTo = (router, route) => {
  router.push(route);
};

export const goBack = (router) => {
  router.back();
};

// Get route info including icon
export const getRouteInfo = (routeName) => {
  const route = ROUTES[routeName.toUpperCase()];
  const name = ROUTE_NAMES[routeName.toUpperCase()];
  const icon = ROUTE_ICONS[routeName.toUpperCase()];
  
  return { route, name, icon };
};

// Example usage:
// import { ROUTES, navigateTo, getRouteInfo } from '../navigation/routes';
// navigateTo(router, ROUTES.PROFILE);
// const profileInfo = getRouteInfo('PROFILE'); // { route: '/profile', name: 'Profile', icon: 'user' }
