import { parse } from '@babel/parser'
import type { Issue } from './index'

export function checkUnusedVars(code: string): Issue[] {
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    })
    
    const declarations: Record<string, { used: boolean, loc: any }> = {}
    const issues: Issue[] = []
    
    function traverse(node: any, isDeclaration = false) {
      if (!node || typeof node !== 'object') return
      
      // Track variable declarations
      if (node.type === 'VariableDeclarator' && node.id?.name) {
        declarations[node.id.name] = {
          used: false,
          loc: node.loc?.start
        }
        // Traverse the declaration itself but don't mark the variable as used
        traverse(node.init, true)
        return
      }
      
      // Mark variables as used when they're referenced (but not in declarations)
      if (node.type === 'Identifier' && node.name in declarations && !isDeclaration) {
        declarations[node.name].used = true
      }
      
      // Traverse child nodes
      for (const key of Object.keys(node)) {
        const child = (node as any)[key]
        if (Array.isArray(child)) {
          child.forEach((c: any) => traverse(c, false))
        } else {
          traverse(child, false)
        }
      }
    }
    
    traverse(ast)
    
    // Report unused variables
    for (const [name, meta] of Object.entries(declarations)) {
      if (!meta.used) {
        issues.push({
          rule: 'unused-vars',
          message: `Variable "${name}" is declared but never used.`,
          severity: 'warn',
          fixHint: `Remove "${name}" or use it.`,
          location: meta.loc ? {
            line: meta.loc.line,
            column: meta.loc.column
          } : undefined
        })
      }
    }
    
    return issues
  } catch (error) {
    return [{
      rule: 'syntax-error',
      message: `Failed to parse code: ${error}`,
      severity: 'error'
    }]
  }
}
