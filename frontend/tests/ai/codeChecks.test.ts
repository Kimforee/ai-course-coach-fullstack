import { describe, it, expect } from 'vitest'
import { analyze } from '../../src/ai/codeChecks'

describe('code checks', () => {
  it('unused vars', () => {
    const code = 'const a = 1; console.log(2)'
    const issues = analyze(code)
    expect(issues.some(i => i.rule === 'unused-vars')).toBe(true)
  })
  
  it('for-loop off-by-one', () => {
    const code = 'for(let i = 0; i <= arr.length; i++) { console.log(arr[i]) }'
    const issues = analyze(code)
    expect(issues.some(i => i.rule === 'for-loop-off-by-one')).toBe(true)
  })
  
  it('missing return', () => {
    const code = 'function add(a, b) { const result = a + b }'
    const issues = analyze(code)
    expect(issues.some(i => i.rule === 'missing-return')).toBe(true)
  })
  
  it('duplicate blocks', () => {
    const code = `
      function test() {
        if (x > 0) {
          console.log('positive')
          return true
        }
        if (y > 0) {
          console.log('positive')
          return true
        }
      }
    `
    const issues = analyze(code)
    expect(issues.some(i => i.rule === 'duplicate-blocks')).toBe(true)
  })
  
  it('should have all 4 rules', () => {
    const code = `
      const unused = 1
      for(let i = 0; i <= arr.length; i++) { console.log(arr[i]) }
      function noReturn() { const x = 1 }
      function test1() {
        if (a > 0) { 
          console.log('test')
          return true
        }
      }
      function test2() {
        if (b > 0) { 
          console.log('test')
          return true
        }
      }
    `
    const issues = analyze(code)
    const rules = [...new Set(issues.map(i => i.rule))]
    expect(rules).toContain('unused-vars')
    expect(rules).toContain('for-loop-off-by-one')
    expect(rules).toContain('missing-return')
    expect(rules).toContain('duplicate-blocks')
  })
})