import { useEffect, useState } from 'react'
import CourseCard from '../components/CourseCard'
import { studentApi, ApiError } from '../services/api'

export default function Dashboard(){
  const [courses, setCourses] = useState<any[]>([])
  const [student, setStudent] = useState<any>(null)
  const [recommendation, setRecommendation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load student overview (includes courses with progress)
        const overview = await studentApi.getOverview(1) // Assuming student ID 1
        setStudent(overview.student)
        setCourses(overview.courses)
        
        // Load AI recommendation
        const rec = await studentApi.getRecommendation(1)
        setRecommendation(rec)
        
      } catch (err) {
        console.error('Error loading data:', err)
        if (err instanceof ApiError) {
          setError(`API Error: ${err.message}`)
        } else {
          setError('Failed to load dashboard data')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Greeting Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {student?.name || 'Student'}! 👋
        </h1>
        <p className="text-indigo-100 text-lg">
          Ready to continue your learning journey? Let's see what's next for you.
        </p>
      </section>

      {/* Courses Grid Section */}
      <section>
        <h2 className='mb-4 text-2xl font-semibold text-gray-800'>My Courses</h2>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={{
                id: course.id.toString(),
                name: course.name,
                progress: course.progress,
                nextUp: course.next_up || undefined,
                lastActivity: course.last_activity ? new Date(course.last_activity).toLocaleDateString() : undefined,
                description: course.description,
                difficulty: course.difficulty
              }}
            />
          ))}
        </div>
      </section>

      {/* AI Course Coach Section */}
      <section className='rounded-2xl border bg-white p-6 shadow-sm'>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <h2 className='text-xl font-semibold'>AI Course Coach</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
            <h3 className="font-semibold text-gray-900 mb-2">AI Recommendation</h3>
            <p className="text-sm text-gray-700 mb-4">
              Backend-powered recommendation with {recommendation?.confidence ? Math.round(recommendation.confidence * 100) : 0}% confidence.
            </p>
            {recommendation ? (
              <div className="space-y-2">
                <div className="bg-white rounded-lg p-3 border">
                  <h4 className="font-medium text-gray-900">{recommendation.recommendation.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Features: {Object.entries(recommendation.reason_features || {}).map(([key, value]) => 
                      `${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`
                    ).join(', ')}
                  </p>
                </div>
                {recommendation.alternatives && recommendation.alternatives.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Alternative options:</p>
                    <ul className="space-y-1">
                      {recommendation.alternatives.map((alt: any, index: number) => (
                        <li key={index} className="text-sm text-gray-600 bg-gray-50 rounded px-2 py-1">
                          {alt.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No recommendation available</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}