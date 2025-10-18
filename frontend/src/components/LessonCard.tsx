type Lesson = {
  id: number
  title: string
  tags: string[]
  order_index: number
  completed?: boolean
  difficulty?: number
}

type Props = {
  lesson: Lesson
  index: number
  total: number
}

export default function LessonCard({ lesson, index, total }: Props) {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800'
    if (difficulty <= 4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy'
    if (difficulty <= 4) return 'Medium'
    return 'Hard'
  }

  return (
    <div className="border rounded-xl p-4 hover:shadow-md transition-shadow duration-200 bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-sm font-medium text-gray-500">
              Lesson {index} of {total}
            </span>
            {lesson.difficulty && (
              <span className={`text-xs rounded-full px-2 py-1 ${getDifficultyColor(lesson.difficulty)}`}>
                {getDifficultyText(lesson.difficulty)}
              </span>
            )}
            {lesson.completed && (
              <span className="text-xs rounded-full px-2 py-1 bg-green-100 text-green-800">
                ✓ Completed
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {lesson.title}
          </h3>
          
          {lesson.tags && lesson.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {lesson.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="ml-4">
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            {lesson.completed ? 'Review' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  )
}
