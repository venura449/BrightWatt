import { Platform } from 'react-native';
import { globalState } from './globalState';


const getBackendUrl = () => {
  return Platform.OS === 'web' ? 'http://localhost:9000' : 'http://192.168.1.16:9000';
};

const API_BASE_URL = `${getBackendUrl()}/api`;

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  energyProvider?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role?: string;
  energyConsumption?: {
    monthlyUsage: number;
    peakUsage: number;
    offPeakUsage: number;
  };
  costSavings?: {
    monthlySavings: number;
    totalSavings: number;
    percentageReduction: number;
  };
  preferences?: {
    notifications: boolean;
    language: string;
    theme: string;
  };
}

interface AuthResponse {
  user: User;
  token: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  energyProvider?: string;
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Solar Panels' | 'Home Installation' | 'Battery Storage' | 'Cost Analysis' | 'Maintenance' | 'Troubleshooting';
  thumbnail: string;
  youtubeUrl: string;
  isActive: boolean;
  order: number;
  tags: string[];
  prerequisites: Lesson[];
  learningObjectives: string[];
  resources: Array<{
    title: string;
    url: string;
    type: 'PDF' | 'Link' | 'Document';
  }>;
  quiz?: {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

interface LessonsResponse {
  lessons: Lesson[];
  pagination?: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'mastery' | 'social' | 'special';
  points: number;
  requirements: {
    type: 'lessons_completed' | 'streak_days' | 'perfect_scores' | 'categories_mastered' | 'total_points';
    value: number;
    category: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserAchievement {
  _id: string;
  user: string;
  achievement: Achievement;
  earnedAt: string;
  pointsEarned: number;
  isNew: boolean;
}

interface UserProgress {
  _id: string;
  user: string;
  lesson: Lesson;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  score: number;
  completedAt: string | null;
  timeSpent: number;
  attempts: number;
  quizResults: Array<{
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }>;
  lastAccessed: string;
}

interface LearningStats {
  totalPoints: number;
  lessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastLessonDate: string | null;
  perfectScores: number;
  categoriesMastered: number;
  categoryProgress: {
    'Solar Panels': number;
    'Home Installation': number;
    'Battery Storage': number;
    'Cost Analysis': number;
    'Maintenance': number;
    'Troubleshooting': number;
  };
}

interface AchievementsResponse {
  achievements: Achievement[];
}

interface UserAchievementsResponse {
  achievements: UserAchievement[];
}

interface ProgressResponse {
  progress: UserProgress[];
}

interface StatsResponse {
  stats: LearningStats;
  recentAchievements: UserAchievement[];
  progressPercentage: number;
  totalLessons: number;
  completedLessons: number;
}

interface LessonResponse {
  lesson: Lesson;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Test backend connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${getBackendUrl()}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = await this.getStoredToken();
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, defaultOptions);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error('API request failed:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      await this.storeToken(response.data.token);
      await this.storeUser(response.data.user);
    }

    return response;
  }

  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      await this.storeToken(response.data.token);
      await this.storeUser(response.data.user);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearStoredData();
    }

    return { success: true, message: 'Logged out successfully' };
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Token storage methods (using AsyncStorage)
  private async storeToken(token: string): Promise<void> {
    try {
      // For now, we'll use a simple approach
      // In a real app, you'd use AsyncStorage or SecureStore
      globalState.setToken(token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      return globalState.getToken();
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  private async storeUser(user: User): Promise<void> {
    try {
      globalState.setUser(user);
    } catch (error) {
      console.error('Failed to store user:', error);
    }
  }

  private async clearStoredData(): Promise<void> {
    try {
      globalState.setToken(null);
      globalState.setUser(null);
    } catch (error) {
      console.error('Failed to clear stored data:', error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) return false;

      // Verify token by making a request to get current user
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get stored user data
  async getStoredUser(): Promise<User | null> {
    try {
      return globalState.getUser();
    } catch (error) {
      console.error('Failed to get stored user:', error);
      return null;
    }
  }

  // Lesson methods
  async getLessons(params?: {
    category?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<LessonsResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.category && params.category !== 'All') {
      queryParams.append('category', params.category);
    }
    if (params?.difficulty) {
      queryParams.append('difficulty', params.difficulty);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<LessonsResponse>(`/lessons${endpoint}`);
  }

  async getLessonsByCategory(category: string): Promise<ApiResponse<LessonsResponse>> {
    return this.request<LessonsResponse>(`/lessons/category/${encodeURIComponent(category)}`);
  }

  async searchLessons(query: string): Promise<ApiResponse<LessonsResponse>> {
    return this.request<LessonsResponse>(`/lessons/search/${encodeURIComponent(query)}`);
  }

  async getLessonById(id: string): Promise<ApiResponse<LessonResponse>> {
    return this.request<LessonResponse>(`/lessons/${id}`);
  }

  async getLessonFull(id: string): Promise<ApiResponse<LessonResponse>> {
    return this.request<LessonResponse>(`/lessons/${id}/full`);
  }

  async getLessonQuiz(id: string): Promise<ApiResponse<{ quiz: Lesson['quiz'] }>> {
    return this.request<{ quiz: Lesson['quiz'] }>(`/lessons/${id}/quiz`);
  }
}

export const apiService = new ApiService();
export type {
    Achievement, AchievementsResponse, ApiResponse,
    AuthResponse, LearningStats, Lesson,
    LessonResponse,
    LessonsResponse,
    LoginData, ProgressResponse, RegisterData, StatsResponse, User, UserAchievement, UserAchievementsResponse, UserProgress
};

