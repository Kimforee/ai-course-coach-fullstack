import { useState } from 'react'
import { analyze } from '../ai/codeChecks'

type Props = {
  courseId: string
}

export default function CodeAttemptViewer({ courseId }: Props) {
  const [code, setCode] = useState('')
  const [issues, setIssues] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setIssues([])
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Use our AST-based code analysis
      const analysisResults = analyze(code)
      setIssues(analysisResults)
    } catch (error) {
      console.error('Analysis error:', error)
      setIssues([{
        rule: 'analysis-error',
        message: `Failed to analyze code: ${error}`,
        severity: 'error'
      }])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warn': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '❌'
      case 'warn': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📝'
    }
  }

  return (
    <div className="space-y-6">
      {/* Code Input Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Enter Your Code</h3>
        <div className="space-y-3">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your JavaScript/TypeScript code here for analysis..."
            className="w-full h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {code.length} characters
            </p>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !code.trim()}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Analysis Results
          {issues.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({issues.length} issue{issues.length !== 1 ? 's' : ''} found)
            </span>
          )}
        </h3>

        {issues.length === 0 && code.trim() && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p>No issues found! Your code looks good.</p>
          </div>
        )}

        {issues.length > 0 && (
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm uppercase tracking-wide">
                        {issue.rule}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                        {issue.severity}
                      </span>
                      {issue.location && (
                        <span className="text-xs text-gray-500">
                          Line {issue.location.line}, Column {issue.location.column}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-2">{issue.message}</p>
                    {issue.fixHint && (
                      <div className="text-xs bg-white/30 p-2 rounded border-l-2 border-current">
                        <strong>💡 Fix hint:</strong> {issue.fixHint}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!code.trim() && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <p>Enter some code above to see the analysis results.</p>
          </div>
        )}
      </div>

      {/* AST Rules Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-sm mb-2">Available Analysis Rules</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>• Unused variables</div>
          <div>• Off-by-one for loops</div>
          <div>• Missing return statements</div>
          <div>• Duplicate code blocks</div>
        </div>
      </div>
    </div>
  )
}
