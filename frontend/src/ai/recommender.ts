import { makeRng } from '../lib/seededRandom'

type Input = { student: any; courses: any[]; attempts: any[] }
export type Recommendation = {
  id: string
  title: string
  reasonFeatures: Record<string, number | string>
  confidence: number
  alternatives: { id: string; title: string; reason: string }[]
  method: 'heuristic'
}

export function recommendNext(input: Input): Recommendation {
  const { student, courses, attempts } = input
  
  // Create deterministic seeded random number generator
  // Use student ID as seed to ensure consistent results for same student
  const studentId = student?.id || 1
  const rng = makeRng(studentId)
  
  // Calculate deterministic features for each course
  const courseScores = courses.map(course => {
    const progress = course.progress ?? 0
    const lastActivity = course.lastActivity ? new Date(course.lastActivity).getTime() : 0
    // Use a fixed reference time for deterministic results
    const now = new Date('2024-01-01T00:00:00Z').getTime()
    const daysSinceActivity = Math.max(0, (now - lastActivity) / (1000 * 60 * 60 * 24))
    
    // Deterministic scoring based on multiple factors
    const progressScore = (100 - progress) / 100 // Higher score for less progress
    const recencyScore = Math.min(1, daysSinceActivity / 30) // Higher score for older activity
    const difficultyScore = (course.difficulty ?? 1) / 5 // Normalize difficulty
    const hintRate = calculateHintRate(attempts, course.id)
    
    // Use seeded random for tie-breaking (deterministic but appears random)
    const randomFactor = rng() * 0.1 // Small random factor for tie-breaking
    
    const totalScore = progressScore * 0.4 + recencyScore * 0.3 + difficultyScore * 0.2 + hintRate * 0.1 + randomFactor
    
    return {
      course,
      score: totalScore,
      features: {
        progress_inverse: 100 - progress,
        recency_gap_days: daysSinceActivity,
        difficulty: course.difficulty ?? 1,
        hint_rate: hintRate * 100
      }
    }
  })
  
  // Sort by score (deterministic due to seeded random)
  courseScores.sort((a, b) => b.score - a.score)
  
  const chosen = courseScores[0]
  const alternatives = courseScores.slice(1, 3)
  
  // Calculate confidence deterministically
  const confidence = Math.min(0.95, Math.max(0.1, chosen.score * 0.8 + 0.2))
  
  return {
    id: chosen.course.id ?? 'unknown',
    title: `Continue "${chosen.course.name ?? 'Course'}" — next lesson`,
    reasonFeatures: chosen.features,
    confidence,
    alternatives: alternatives.map(alt => ({
      id: alt.course.id,
      title: `Work on "${alt.course.name}"`,
      reason: `Score: ${alt.score.toFixed(2)}`
    })),
    method: 'heuristic'
  }
}

// Helper function to calculate hint rate deterministically
function calculateHintRate(attempts: any[], courseId: string): number {
  const courseAttempts = attempts.filter(attempt => 
    attempt.lesson?.course === courseId || attempt.courseId === courseId
  )
  
  if (courseAttempts.length === 0) return 0
  
  const totalHints = courseAttempts.reduce((sum, attempt) => sum + (attempt.hints_used || 0), 0)
  const totalAttempts = courseAttempts.length
  
  return totalHints / (totalAttempts * 3) // Normalize by max possible hints per attempt
}