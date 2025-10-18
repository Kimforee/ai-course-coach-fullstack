import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'

type Course = {
  id: string
  name: string
  progress: number
  nextUp?: string | null
  lastActivity?: string | null
  description?: string
  difficulty?: number
}

export default function CourseCard({ course }: { course: Course }) {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800'
    if (difficulty <= 4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 2) return 'Beginner'
    if (difficulty <= 4) return 'Intermediate'
    return 'Advanced'
  }

  return (
    <div className='rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200'>
      {/* Header with course name and difficulty */}
      <div className='flex items-start justify-between mb-3'>
        <h3 className='text-lg font-semibold text-gray-900 flex-1'>{course.name}</h3>
        {course.difficulty && (
          <span className={`text-xs rounded-full px-2 py-1 ${getDifficultyColor(course.difficulty)}`}>
            {getDifficultyText(course.difficulty)}
          </span>
        )}
      </div>

      {/* Description */}
      {course.description && (
        <p className='text-sm text-gray-600 mb-4 line-clamp-2'>{course.description}</p>
      )}

      {/* Next Up Badge */}
      {course.nextUp && (
        <div className='mb-3'>
          <span className='text-xs rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 font-medium'>
            Next: {course.nextUp}
          </span>
        </div>
      )}

      {/* Progress Section */}
      <div className='mb-4'>
        <div className='flex justify-between items-center mb-2'>
          <span className='text-sm font-medium text-gray-700'>Progress</span>
          <span className='text-sm text-gray-600'>{course.progress}%</span>
        </div>
        <ProgressBar value={course.progress} />
      </div>

      {/* Last Activity */}
      {course.lastActivity && (
        <div className='mb-4 text-xs text-gray-500 flex items-center'>
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Last activity: {course.lastActivity}
        </div>
      )}

              {/* Action Button */}
              <Link
                to={`/course/${course.id}`}
                className='w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors duration-200 text-center block'
              >
                View Details
              </Link>
    </div>
  )
}
