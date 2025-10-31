import { User } from '../lib/api';

declare global {
  var token: string | null;
  var user: User | null;
  
  // Add any other global variables you might use
  var isAuthenticated: boolean;
  var currentLesson: any;
}

export { };

