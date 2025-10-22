import { parse } from '@babel/parser'
import { Issue } from './index'

export function checkDuplicateBlocks(code: string): Issue[] {
  const issues: Issue[] = []
  
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx']
    })
    
    const blockHashes: Map<string, any[]> = new Map()
    
    // Simple hash function for block statements
    function getBlockHash(node: any): string | null {
      if (!node || node.type !== 'BlockStatement') {
        return null
      }
      
      // Create a simple hash based on the structure and content
      const body = node.body || []
      const hash = body.map((stmt: any) => {
        if (stmt.type === 'IfStatement') {
          return `if(${stmt.test?.type}){${stmt.consequent?.type}}`
        }
        if (stmt.type === 'ExpressionStatement' && stmt.expression?.type === 'CallExpression') {
          return `call(${stmt.expression.callee?.name || 'anonymous'})`
        }
        if (stmt.type === 'ReturnStatement') {
          return `return(${stmt.argument?.type || 'void'})`
        }
        if (stmt.type === 'VariableDeclaration') {
          return `var(${stmt.declarations?.length || 0})`
        }
        return stmt.type
      }).join('|')
      
      return hash
    }
    
    // Traverse AST to find block statements
    function traverse(node: any) {
      if (!node) return
      
      if (node.type === 'BlockStatement') {
        const hash = getBlockHash(node)
        if (hash && hash.length > 10) { // Only consider blocks with some content
          if (blockHashes.has(hash)) {
            const existingBlocks = blockHashes.get(hash)!
            // Only report if this is the first time we're seeing this duplicate
            if (existingBlocks.length === 1) {
              issues.push({
                rule: 'duplicate-blocks',
                message: 'Duplicate code blocks detected.',
                nodeType: 'BlockStatement',
                severity: 'warn',
                fixHint: 'Refactor duplicate code into a reusable function or consolidate logic.',
                location: node.loc ? {
                  line: node.loc.start.line,
                  column: node.loc.start.column
                } : undefined
              })
            }
            existingBlocks.push(node)
          } else {
            blockHashes.set(hash, [node])
          }
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
