// Updated routes.js - now using centralized navigation with Expo Router
import { ROUTES } from '../src/navigation/routes';

const routes = {
  HOME: ROUTES.HOME,
  LOGIN: ROUTES.LOGIN,
  REGISTER: ROUTES.REGISTER,
  PROFILE: ROUTES.PROFILE,
  SETTINGS: "/settings" // Keep existing for backward compatibility
};

export default routes;
