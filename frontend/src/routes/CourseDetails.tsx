import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import LessonCard from '../components/LessonCard'
import CodeAttemptViewer from '../components/CodeAttemptViewer'

export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load course and lessons data
    Promise.all([
      fetch('/data/courses.json').then(r => r.json()),
      fetch('/data/lessons.json').then(r => r.json())
    ]).then(([courses, allLessons]) => {
      const currentCourse = courses.find((c: any) => c.id.toString() === courseId)
      const courseLessons = allLessons.filter((l: any) => l.course === parseInt(courseId || '0'))
      
      setCourse(currentCourse)
      setLessons(courseLessons)
      setLoading(false)
    }).catch(err => {
      console.error('Error loading course data:', err)
      setLoading(false)
    })
  }, [courseId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
        <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
        <Link 
          to="/" 
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
            <p className="text-indigo-100 text-lg mb-4">{course.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {course.difficulty <= 2 ? 'Beginner' : course.difficulty <= 4 ? 'Intermediate' : 'Advanced'}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {lessons.length} lessons
              </span>
            </div>
          </div>
          <Link 
            to="/" 
            className="text-indigo-100 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Course Progress</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-600">{course.progress}%</span>
            </div>
            <div className="w-full rounded-xl bg-gray-200 h-3 overflow-hidden">
              <div
                className="h-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Lessons</h2>
        <div className="grid gap-4">
          {lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index + 1}
              total={lessons.length}
            />
          ))}
        </div>
      </div>

      {/* Code Attempt Viewer */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Code Attempt Viewer</h2>
        <CodeAttemptViewer courseId={courseId || ''} />
      </div>
    </div>
  )
}
