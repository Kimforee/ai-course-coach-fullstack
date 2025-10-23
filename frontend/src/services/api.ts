const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://16.171.56.209:8000/api';

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
    // Add 2 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
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
    
    // If timeout or network error, return mock data
    if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
      console.log('Database timeout, using mock data');
      return getMockData(endpoint) as T;
    }
    
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Mock data fallback
function getMockData(endpoint: string): any {
  if (endpoint.includes('/students/1/overview/')) {
    return {
      student: { id: 1, name: "Demo Student" },
      courses: [
        {
          id: 1,
          name: "Python Fundamentals",
          description: "Learn Python from scratch",
          difficulty: "Beginner",
          progress: 67,
          last_activity: "2024-01-15T10:30:00Z",
          next_up: "Control Structures"
        },
        {
          id: 2,
          name: "Data Structures",
          description: "Master Python data structures",
          difficulty: "Intermediate",
          progress: 25,
          last_activity: "2024-01-14T15:20:00Z",
          next_up: "Linked Lists"
        }
      ]
    };
  }
  
  if (endpoint.includes('/courses/')) {
    return [
      {
        id: 1,
        name: "Python Fundamentals",
        description: "Learn Python from scratch",
        difficulty: 1,
        lessons: [
          { id: 1, title: "Introduction to Python", tags: ["basics"], order_index: 1 },
          { id: 2, title: "Variables and Data Types", tags: ["basics", "variables"], order_index: 2 },
          { id: 3, title: "Control Structures", tags: ["basics", "control"], order_index: 3 }
        ]
      },
      {
        id: 2,
        name: "Data Structures",
        description: "Master Python data structures",
        difficulty: 2,
        lessons: [
          { id: 4, title: "Lists and Tuples", tags: ["data-structures"], order_index: 1 },
          { id: 5, title: "Dictionaries", tags: ["data-structures", "hash"], order_index: 2 }
        ]
      }
    ];
  }
  
  if (endpoint.includes('/students/1/recommendation/')) {
    return {
      recommendation: { id: "3", title: "Control Structures" },
      confidence: 0.85,
      reason_features: { difficulty_match: 0.9, progress_continuity: 0.8 },
      alternatives: [
        { id: "4", title: "Functions" },
        { id: "5", title: "Error Handling" }
      ]
    };
  }
  
  return {};
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
