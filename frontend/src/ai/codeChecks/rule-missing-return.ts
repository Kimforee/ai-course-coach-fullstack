import { parse } from '@babel/parser'
import { Issue } from './index'

export function checkMissingReturn(code: string): Issue[] {
  const issues: Issue[] = []
  
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx']
    })
    
    // Helper function to check if a function has a return statement
    function hasReturnStatement(node: any): boolean {
      if (!node) return false
      
      if (node.type === 'ReturnStatement') {
        return true
      }
      
      // Check if any child has a return statement
      for (const key in node) {
        if (key === 'parent' || key === 'loc') continue
        const child = node[key]
        if (Array.isArray(child)) {
          if (child.some(hasReturnStatement)) return true
        } else if (child && typeof child === 'object' && hasReturnStatement(child)) {
          return true
        }
      }
      
      return false
    }
    
    // Helper function to check if a function should have a return statement
    function shouldHaveReturn(node: any): boolean {
      // All functions should have return statements (we'll be more lenient in practice)
      return true
    }
    
    // Traverse AST to find functions
    function traverse(node: any) {
      if (!node) return
      
      // Check function declarations
      if (node.type === 'FunctionDeclaration') {
        if (node.body && node.body.type === 'BlockStatement' && !hasReturnStatement(node.body)) {
          issues.push({
            rule: 'missing-return',
            message: `Function '${node.id?.name || 'anonymous'}' should have a return statement`,
            nodeType: 'FunctionDeclaration',
            severity: 'warn',
            fixHint: 'Add a return statement to the function body',
            location: node.loc ? {
              line: node.loc.start.line,
              column: node.loc.start.column
            } : undefined
          })
        }
      }
      
      // Check function expressions
      if (node.type === 'FunctionExpression') {
        if (node.body && node.body.type === 'BlockStatement' && !hasReturnStatement(node.body)) {
          issues.push({
            rule: 'missing-return',
            message: 'Function expression should have a return statement',
            nodeType: 'FunctionExpression',
            severity: 'warn',
            fixHint: 'Add a return statement to the function body',
            location: node.loc ? {
              line: node.loc.start.line,
              column: node.loc.start.column
            } : undefined
          })
        }
      }
      
      // Check arrow functions with block body
      if (node.type === 'ArrowFunctionExpression' && node.body && node.body.type === 'BlockStatement') {
        if (!hasReturnStatement(node.body)) {
          issues.push({
            rule: 'missing-return',
            message: 'Arrow function should have a return statement',
            nodeType: 'ArrowFunctionExpression',
            severity: 'warn',
            fixHint: 'Add a return statement to the function body or use implicit return',
            location: node.loc ? {
              line: node.loc.start.line,
              column: node.loc.start.column
            } : undefined
          })
        }
      }
      
      // Traverse child nodes
      for (const key in node) {
        if (key === 'parent' || key === 'loc') continue
        const child = node[key]
        if (Array.isArray(child)) {
          child.forEach(traverse)
        } else if (child && typeof child === 'object') {
          traverse(child)
        }
      }
    }
    
    traverse(ast)
    
  } catch (error) {
    issues.push({
      rule: 'syntax-error',
      message: `Failed to parse code: ${error}`,
      severity: 'error'
    })
  }
  
  return issues
}
