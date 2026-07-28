import { useState, useCallback } from 'react'
import type { MatchResult, RegexResult, TestCase } from '../types'
import { escapeHtml } from '../lib/utils'

interface Props {
  regex: RegexResult
  pattern: string
  flags: string
  testCases: TestCase[]
  onLoadTestCase?: (testCase: TestCase) => void
}

interface TestResult {
  testCase: TestCase
  passed: boolean
  actualMatches: MatchResult[]
  expectedMatches?: string[]
  error?: string
}

export default function TestCaseRunner({ regex, pattern, flags, testCases, onLoadTestCase }: Props) {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<TestResult[] | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const runAllTests = useCallback(async () => {
    if (!regex.ok || !testCases.length || running) return
    setRunning(true)
    setResults(null)

    const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
    const testResults: TestResult[] = []

    for (const tc of testCases) {
      try {
        const matches: MatchResult[] = []
        const testRe = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
        let m: RegExpExecArray | null
        while ((m = testRe.exec(tc.testStr)) !== null) {
          const groups: (string | undefined)[] = []
          for (let i = 1; i < m.length; i++) groups.push(m[i])
          matches.push({ full: m[0], groups, index: m.index })
          if (!re.global) break
        }

        let passed = false
        if (tc.expectedMatches && tc.expectedMatches.length > 0) {
          passed = JSON.stringify(matches.map(m => m.full)) === JSON.stringify(tc.expectedMatches)
        } else {
          passed = matches.length > 0
        }

        testResults.push({
          testCase: tc,
          passed,
          actualMatches: matches,
          expectedMatches: tc.expectedMatches,
        })
      } catch (e) {
        testResults.push({
          testCase: tc,
          passed: false,
          actualMatches: [],
          error: (e as Error).message,
        })
      }
    }

    setResults(testResults)
    setRunning(false)
  }, [regex.ok, pattern, flags, testCases, running])

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id)
  }

  const handleLoadTestCase = (tc: TestCase) => {
    onLoadTestCase?.(tc)
  }

  if (!testCases.length) {
    return (
      <section className="space-y-1.5">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Test Runner</label>
        <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-600 italic">
          No test cases saved. Add test cases in the Test Cases panel first.
        </div>
      </section>
    )
  }

  const passedCount = results?.filter(r => r.passed).length ?? 0
  const totalCount = testCases.length

  return (
    <section className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Test Runner</label>
        {results && (
          <span className={`text-xs font-mono ${passedCount === totalCount ? 'text-emerald-400' : 'text-amber-400'}`}>
            {passedCount}/{totalCount} passed
          </span>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 space-y-2">
        {!results ? (
          <>
            <button
              onClick={runAllTests}
              disabled={!regex.ok || running}
              className="w-full px-3 py-1.5 text-xs rounded bg-cyan-900/50 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {running ? '⏳ Running…' : '▶ Run All Test Cases'}
            </button>
            <p className="text-[10px] text-zinc-600">
              Runs all {totalCount} test case{totalCount !== 1 ? 's' : ''} against current pattern.
              {regex.ok ? '' : ' Fix pattern errors first.'}
            </p>
          </>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${passedCount === totalCount ? 'text-emerald-400' : 'text-amber-400'}`}>
                {passedCount === totalCount ? '✓ All passed' : `✗ ${totalCount - passedCount} failed`}
              </span>
              <button
                onClick={() => setResults(null)}
                className="ml-auto px-2 py-0.5 text-[10px] rounded bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Run Again
              </button>
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {results.map(r => (
                <div
                  key={r.testCase.id}
                  className={`bg-zinc-800/50 rounded px-2 py-1.5 ${r.passed ? 'border-l-2 border-emerald-600' : 'border-l-2 border-red-600'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-mono ${r.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                          {r.passed ? '✓' : '✗'}
                        </span>
                        <span className="text-xs text-zinc-300 truncate">{r.testCase.name}</span>
                      </div>
                      <div className="ml-5 text-[10px] text-zinc-500 font-mono truncate">
                        {r.testCase.testStr.slice(0, 80)}{r.testCase.testStr.length > 80 ? '…' : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(r.testCase.id)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 shrink-0"
                      title={expanded === r.testCase.id ? 'Collapse' : 'Expand'}
                    >
                      {expanded === r.testCase.id ? '▲' : '▼'}
                    </button>
                    <button
                      onClick={() => handleLoadTestCase(r.testCase)}
                      className="text-[10px] text-cyan-500 hover:text-cyan-400 shrink-0"
                      title="Load test string"
                    >
                      Load
                    </button>
                  </div>

                  {expanded === r.testCase.id && (
                    <div className="mt-2 space-y-1.5 pt-2 border-t border-zinc-800">
                      <div className="text-[10px] text-zinc-500">Input: <code className="text-zinc-400 font-mono">{escapeHtml(r.testCase.testStr)}</code></div>

                      {r.error && (
                        <div className="text-[10px] text-red-400 bg-red-900/20 rounded px-1.5 py-0.5 font-mono">
                          Error: {r.error}
                        </div>
                      )}

                      {r.expectedMatches && r.expectedMatches.length > 0 && (
                        <div className="text-[10px] text-zinc-500">
                          Expected: <code className="text-amber-300 font-mono">{r.expectedMatches.join(', ')}</code>
                        </div>
                      )}

                      <div className="text-[10px] text-zinc-500">
                        Actual: <code className="text-cyan-300 font-mono">
                          {r.actualMatches.length > 0
                            ? r.actualMatches.map(m => escapeHtml(m.full)).join(', ')
                            : '<no matches>'}
                        </code>
                      </div>

                      {r.actualMatches.length > 0 && (
                        <div className="text-[10px] text-zinc-500">
                          Groups:{' '}
                          {r.actualMatches[0].groups.length > 0
                            ? r.actualMatches[0].groups.map((g, i) => (
                                <code key={i} className="text-zinc-300 font-mono mx-0.5">${i + 1}:${g ?? 'undefined'}</code>
                              ))
                            : '<none>'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}