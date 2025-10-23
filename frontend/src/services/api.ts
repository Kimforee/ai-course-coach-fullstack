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
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('Failed to fetch'))) {
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
      student: { id: 1, name: "Ananya" },
      courses: [
        {
          id: 1,
          name: "Python Fundamentals",
          description: "Learn Python from scratch with hands-on projects",
          difficulty: "Beginner",
          progress: 75,
          last_activity: "2024-01-15T10:30:00Z",
          next_up: "Functions and Modules"
        },
        {
          id: 2,
          name: "Web Development with React",
          description: "Build modern web applications using React and JavaScript",
          difficulty: "Intermediate",
          progress: 45,
          last_activity: "2024-01-14T15:20:00Z",
          next_up: "State Management"
        },
        {
          id: 3,
          name: "Data Science with Python",
          description: "Analyze data and build machine learning models",
          difficulty: "Advanced",
          progress: 20,
          last_activity: "2024-01-13T09:15:00Z",
          next_up: "Data Visualization"
        }
      ]
    };
  }
  
  if (endpoint.includes('/courses/')) {
    return [
      {
        id: 1,
        name: "Python Fundamentals",
        description: "Learn Python from scratch with hands-on projects",
        difficulty: 1,
        lessons: [
          { id: 1, title: "Introduction to Python", tags: ["basics", "setup"], order_index: 1 },
          { id: 2, title: "Variables and Data Types", tags: ["basics", "variables"], order_index: 2 },
          { id: 3, title: "Control Structures", tags: ["basics", "control"], order_index: 3 },
          { id: 4, title: "Functions and Modules", tags: ["functions", "modules"], order_index: 4 },
          { id: 5, title: "Object-Oriented Programming", tags: ["oop", "classes"], order_index: 5 }
        ]
      },
      {
        id: 2,
        name: "Web Development with React",
        description: "Build modern web applications using React and JavaScript",
        difficulty: 2,
        lessons: [
          { id: 6, title: "HTML and CSS Basics", tags: ["html", "css"], order_index: 1 },
          { id: 7, title: "JavaScript Fundamentals", tags: ["javascript", "es6"], order_index: 2 },
          { id: 8, title: "React Components", tags: ["react", "components"], order_index: 3 },
          { id: 9, title: "State Management", tags: ["react", "state"], order_index: 4 },
          { id: 10, title: "API Integration", tags: ["api", "fetch"], order_index: 5 }
        ]
      },
      {
        id: 3,
        name: "Data Science with Python",
        description: "Analyze data and build machine learning models",
        difficulty: 3,
        lessons: [
          { id: 11, title: "NumPy and Pandas", tags: ["numpy", "pandas"], order_index: 1 },
          { id: 12, title: "Data Visualization", tags: ["matplotlib", "seaborn"], order_index: 2 },
          { id: 13, title: "Machine Learning Basics", tags: ["sklearn", "ml"], order_index: 3 },
          { id: 14, title: "Deep Learning with TensorFlow", tags: ["tensorflow", "neural-networks"], order_index: 4 },
          { id: 15, title: "Data Analysis Project", tags: ["project", "analysis"], order_index: 5 }
        ]
      }
    ];
  }
  
  if (endpoint.includes('/courses/1/')) {
    return {
      id: 1,
      name: "Python Fundamentals",
      description: "Learn Python from scratch with hands-on projects. This course covers everything from basic syntax to advanced concepts like object-oriented programming.",
      difficulty: 1,
      lessons: [
        { id: 1, title: "Introduction to Python", tags: ["basics", "setup"], order_index: 1 },
        { id: 2, title: "Variables and Data Types", tags: ["basics", "variables"], order_index: 2 },
        { id: 3, title: "Control Structures", tags: ["basics", "control"], order_index: 3 },
        { id: 4, title: "Functions and Modules", tags: ["functions", "modules"], order_index: 4 },
        { id: 5, title: "Object-Oriented Programming", tags: ["oop", "classes"], order_index: 5 }
      ]
    };
  }
  
  if (endpoint.includes('/courses/2/')) {
    return {
      id: 2,
      name: "Web Development with React",
      description: "Build modern web applications using React and JavaScript. Learn to create interactive user interfaces and manage application state.",
      difficulty: 2,
      lessons: [
        { id: 6, title: "HTML and CSS Basics", tags: ["html", "css"], order_index: 1 },
        { id: 7, title: "JavaScript Fundamentals", tags: ["javascript", "es6"], order_index: 2 },
        { id: 8, title: "React Components", tags: ["react", "components"], order_index: 3 },
        { id: 9, title: "State Management", tags: ["react", "state"], order_index: 4 },
        { id: 10, title: "API Integration", tags: ["api", "fetch"], order_index: 5 }
      ]
    };
  }
  
  if (endpoint.includes('/courses/3/')) {
    return {
      id: 3,
      name: "Data Science with Python",
      description: "Analyze data and build machine learning models. Master data manipulation, visualization, and machine learning techniques.",
      difficulty: 3,
      lessons: [
        { id: 11, title: "NumPy and Pandas", tags: ["numpy", "pandas"], order_index: 1 },
        { id: 12, title: "Data Visualization", tags: ["matplotlib", "seaborn"], order_index: 2 },
        { id: 13, title: "Machine Learning Basics", tags: ["sklearn", "ml"], order_index: 3 },
        { id: 14, title: "Deep Learning with TensorFlow", tags: ["tensorflow", "neural-networks"], order_index: 4 },
        { id: 15, title: "Data Analysis Project", tags: ["project", "analysis"], order_index: 5 }
      ]
    };
  }
  
  if (endpoint.includes('/students/1/recommendation/')) {
    return {
      recommendation: { id: "4", title: "Functions and Modules" },
      confidence: 0.92,
      reason_features: { difficulty_match: 0.95, progress_continuity: 0.89 },
      alternatives: [
        { id: "9", title: "State Management" },
        { id: "11", title: "NumPy and Pandas" }
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
