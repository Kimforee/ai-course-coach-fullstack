import { useEffect, useState } from 'react'
import CourseCard from '../components/CourseCard'
import { recommendNext } from '../ai/recommender'
import { formatExplanation } from '../ai/explain'

export default function Dashboard(){
  const [courses, setCourses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [explain, setExplain] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/data/courses.json').then(r => r.json()),
      fetch('/data/students.json').then(r => r.json()),
      fetch('/data/attempts.json').then(r => r.json())
    ]).then(([c, s, a]) => {
      setCourses(c)
      setStudents(s)
      setAttempts(a)
      setLoading(false)
      
      // Generate AI recommendation explanation
      const rec = recommendNext({ student: s[0], courses: c, attempts: a })
      setExplain(formatExplanation(rec))
    }).catch(err => {
      console.error('Error loading data:', err)
      setLoading(false)
    })
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

  return (
    <div className='space-y-6'>
      {/* Greeting Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {students[0]?.name || 'Student'}! 👋
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
                nextUp: course.nextUp || undefined,
                lastActivity: course.lastActivity ? new Date(course.lastActivity).toLocaleDateString() : undefined,
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
            <p className="text-sm text-gray-700 mb-4">Deterministic local recommendation with human-readable explanation.</p>
            <pre className='whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm'>{explain}</pre>
          </div>
        </div>
      </section>
    </div>
  )
}