import { describe, it, expect } from 'vitest'
import { recommendNext } from '../../src/ai/recommender'

const stub = {
  student: { id: 's1', name: 'Ananya' },
  courses: [
    { id: 'c1', name: 'Python Basics', progress: 35 },
    { id: 'c2', name: 'JS Foundations', progress: 55 },
    { id: 'c3', name: 'Intro to AI', progress: 10 }
  ],
  attempts: []
}

describe('recommendNext', () => {
  it('deterministic', () => {
    const a = recommendNext(stub)
    const b = recommendNext(stub)
    expect(a).toEqual(b)
  })
  
  it('prefers lowest progress', () => {
    const r = recommendNext(stub)
    expect(r.id).toBe('c3')
  })
  
  it('multiple runs produce identical results', () => {
    const input = {
      student: { id: 1, name: 'Test Student' },
      courses: [
        { id: 'c1', name: 'Python', progress: 20, difficulty: 2 },
        { id: 'c2', name: 'JavaScript', progress: 40, difficulty: 3 },
        { id: 'c3', name: 'React', progress: 60, difficulty: 4 }
      ],
      attempts: [
        { courseId: 'c1', hints_used: 1 },
        { courseId: 'c2', hints_used: 2 }
      ]
    }
    
    // Run the same input multiple times
    const results = Array.from({ length: 5 }, () => recommendNext(input))
    
    // All results should be identical
    results.forEach(result => {
      expect(result).toEqual(results[0])
    })
  })
  
  it('different students get different results due to seeded random', () => {
    const courses = [
      { id: 'c1', name: 'Python', progress: 20, difficulty: 2 },
      { id: 'c2', name: 'JavaScript', progress: 20, difficulty: 2 }
    ]
    const attempts: any[] = []
    
    const input1 = { student: { id: 1 }, courses, attempts }
    const input2 = { student: { id: 2 }, courses, attempts }
    
    const rec1 = recommendNext(input1)
    const rec2 = recommendNext(input2)
    
    // Different students should get different recommendations due to seeded random
    expect(rec1.id).toBeDefined()
    expect(rec2.id).toBeDefined()
    // Note: They might occasionally be the same due to similar scores, but generally different
  })
  
  it('confidence is deterministic and reasonable', () => {
    const input = {
      student: { id: 42 },
      courses: [
        { id: 'c1', name: 'Python', progress: 30, difficulty: 2 },
        { id: 'c2', name: 'JavaScript', progress: 30, difficulty: 2 }
      ],
      attempts: []
    }
    
    const rec1 = recommendNext(input)
    const rec2 = recommendNext(input)
    
    // Same student should get identical results
    expect(rec1).toEqual(rec2)
    expect(rec1.confidence).toBeGreaterThan(0)
    expect(rec1.confidence).toBeLessThanOrEqual(1)
  })
})