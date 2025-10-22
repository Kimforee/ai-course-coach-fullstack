const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error response: ${errorText}`);
      throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Student API
export const studentApi = {
  getOverview: (studentId: number) => 
    apiRequest<{
      student: { id: number; name: string };
      courses: Array<{
        id: number;
        name: string;
        description: string;
        difficulty: string;
        progress: number;
        last_activity: string | null;
        next_up: string | null;
      }>;
    }>(`/students/${studentId}/overview/`),

  getRecommendation: (studentId: number) =>
    apiRequest<{
      recommendation: { id: string; title: string };
      confidence: number;
      reason_features: any;
      alternatives: Array<{ id: string; title: string }>;
    }>(`/students/${studentId}/recommendation/`),
};

// Attempt API
export const attemptApi = {
  create: (data: {
    student: number;
    lesson: number;
    code: string;
    hints_used: number;
    success: boolean;
  }) =>
    apiRequest<{ id: number }>('/attempts/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Code Analysis API
export const codeAnalysisApi = {
  analyze: (code: string) =>
    apiRequest<{
      issues: Array<{
        rule: string;
        message: string;
        severity: 'error' | 'warn' | 'info';
      }>;
    }>('/analyze-code/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};

// Course API
export const courseApi = {
  getList: () =>
    apiRequest<Array<{
      id: number;
      name: string;
      description: string;
      difficulty: number;
      lessons: Array<{
        id: number;
        title: string;
        tags: string[];
        order_index: number;
      }>;
    }>>('/courses/'),

  getDetail: (courseId: number) =>
    apiRequest<{
      id: number;
      name: string;
      description: string;
      difficulty: number;
      lessons: Array<{
        id: number;
        title: string;
        tags: string[];
        order_index: number;
      }>;
    }>(`/courses/${courseId}/`),

  getLessons: (courseId: number) =>
    apiRequest<Array<{
      id: number;
      title: string;
      tags: string[];
      order_index: number;
    }>>(`/courses/${courseId}/lessons/`),
};

export { ApiError };
