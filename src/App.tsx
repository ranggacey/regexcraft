import { useState, useMemo, useCallback, useEffect, useRef, Suspense, lazy } from 'react'
import type { MatchResult } from './types'
import { encodeState, decodeState, detectCatastrophicPattern, getSavedPatterns } from './lib/utils'
import PatternInput from './components/PatternInput'
import TestStringInput from './components/TestStringInput'
import ResultsDisplay from './components/ResultsDisplay'
import MatchDetails from './components/MatchDetails'
import RegexExplainer from './components/RegexExplainer'
import CheatSheet from './components/CheatSheet'
import SavedPatterns from './components/SavedPatterns'
import TestCases from './components/TestCases'
import TestCaseRunner from './components/TestCaseRunner'
import BenchmarkMode from './components/BenchmarkMode'

const RegexVisualizer = lazy(() => import('./components/RegexVisualizer'))

function loadFromHash(): { pattern: string; flags: string; testStr: string } | null {
  const hash = location.hash.replace(/^#/, '')
  if (!hash) return null
  return decodeState(hash)
}

export default function App() {
  const saved = useRef(loadFromHash())
  const [pattern, setPattern] = useState(saved.current?.pattern ?? '(\\w+)@(\\w+\\.\\w+)')
  const [flags, setFlags] = useState(saved.current?.flags ?? 'gi')
  const [testStr, setTestStr] = useState(saved.current?.testStr ?? 'hello@example.com\nuser@domain.org\nnot-an-email@')
  const [copyOk, setCopyOk] = useState(false)
  const [permalinkOk, setPermalinkOk] = useState(false)
  const [replaceMode, setReplaceMode] = useState(false)
  const [replaceStr, setReplaceStr] = useState('[$1]')
  const [cheatOpen, setCheatOpen] = useState(false)
  const [execTime, setExecTime] = useState(0)
  const [perfWarning, setPerfWarning] = useState('')
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null)

  // Performance warning on pattern change
  useEffect(() => {
    if (pattern) {
      setPerfWarning(detectCatastrophicPattern(pattern))
    } else {
      setPerfWarning('')
    }
  }, [pattern])

  // Keyboard shortcuts: Cmd+K -> focus pattern, Cmd+L -> focus test string, Escape -> close cheat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('pattern-input')?.focus()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault()
        document.getElementById('test-string-input')?.focus()
      }
      if (e.key === 'Escape' && cheatOpen) {
        e.preventDefault()
        setCheatOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cheatOpen])

  // Sync state to URL hash
  useEffect(() => {
    const enc = encodeState(pattern, flags, testStr)
    const newHash = '#' + enc
    if (location.hash !== newHash) {
      history.replaceState(null, '', newHash)
    }
  }, [pattern, flags, testStr])

  const regex = useMemo(() => {
    try {
      return { ok: true as const, re: new RegExp(pattern, flags), error: null }
    } catch (e) {
      return { ok: false as const, re: null, error: (e as Error).message }
    }
  }, [pattern, flags])

  const matches = useMemo(() => {
    if (!regex.ok || !testStr) return null
    const t0 = performance.now()
    const ms: MatchResult[] = []
    const re = new RegExp(regex.re.source, regex.re.flags.includes('g') ? regex.re.flags : regex.re.flags + 'g')
    const hasIndices = flags.includes('d')
    let m: RegExpExecArray | null
    while ((m = re.exec(testStr)) !== null) {
      const groups: (string | undefined)[] = []
      for (let i = 1; i < m.length; i++) groups.push(m[i])
      const match: MatchResult = { full: m[0], groups, index: m.index }
      if (hasIndices && m.indices) {
        match.indices = m.indices as [number, number][]
      }
      ms.push(match)
      if (!re.global) break
    }
    setExecTime(Math.round(performance.now() - t0))
    return ms
  }, [regex, testStr, flags])

  const replaceOutput = useMemo(() => {
    if (!replaceMode || !regex.ok || !testStr) return null
    try {
      return testStr.replace(regex.re, replaceStr)
    } catch {
      return '⚠ Invalid replacement string'
    }
  }, [replaceMode, regex.ok, regex.re, testStr, replaceStr])

  const toggleFlag = useCallback((f: string) => {
    setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)
  }, [])

  const copyRegex = useCallback(() => {
    navigator.clipboard?.writeText(`/${pattern}/${flags}`).then(() => {
      setCopyOk(true)
      setTimeout(() => setCopyOk(false), 1500)
    })
  }, [pattern, flags])

  const copyPermalink = useCallback(() => {
    navigator.clipboard?.writeText(location.href).then(() => {
      setPermalinkOk(true)
      setTimeout(() => setPermalinkOk(false), 1500)
    })
  }, [])

  const selectPattern = useCallback((p: string) => {
    setPattern(p)
  }, [])

  const selectSavedPattern = useCallback((p: string, f: string) => {
    setPattern(p)
    setFlags(f)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <span className="text-xl">🔧</span>
        <h1 className="text-lg font-bold tracking-tight">RegexCraft</h1>
        <span className="text-xs text-zinc-500 hidden sm:inline">— interactive regex tester</span>
        <nav className="ml-auto flex gap-2">
          <button
            onClick={() => setReplaceMode(r => !r)}
            className={`px-2 py-0.5 text-xs rounded border transition-colors ${
              replaceMode
                ? 'bg-emerald-900/50 border-emerald-600 text-emerald-300'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle replace mode"
          >
            ✏️ Replace
          </button>
          <button
            onClick={() => setCheatOpen(true)}
            className="px-2 py-0.5 text-xs rounded border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Regex cheat sheet"
          >
            📖 Cheats
          </button>
          <button
            onClick={copyPermalink}
            className="px-2 py-0.5 text-xs rounded border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Copy shareable link (all state saved in URL)"
          >
            {permalinkOk ? '✓ link copied' : '🔗 Share'}
          </button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left column — 3/5 */}
          <div className="lg:col-span-3 space-y-4">
            <PatternInput
              pattern={pattern}
              setPattern={setPattern}
              flags={flags}
              setFlags={setFlags}
              regex={regex}
              copyOk={copyOk}
              onCopy={copyRegex}
              onToggleFlag={toggleFlag}
            />

            {perfWarning && (
              <div className="bg-amber-900/20 border border-amber-700/40 rounded px-3 py-2 text-xs text-amber-300" role="alert">
                {perfWarning}
              </div>
            )}

            <TestStringInput
              testStr={testStr}
              setTestStr={setTestStr}
              replaceMode={replaceMode}
              replaceStr={replaceStr}
              setReplaceStr={setReplaceStr}
            />

            <ResultsDisplay
              matches={matches}
              testStr={testStr}
              regexOk={regex.ok}
              replaceOutput={replaceOutput}
              replaceMode={replaceMode}
            />

            <MatchDetails matches={matches} />
          </div>

          {/* Right column — 2/5 */}
          <div className="lg:col-span-2 space-y-4">
            {!replaceMode && (
              <RegexExplainer pattern={pattern} regexOk={regex.ok} />
            )}

            {!replaceMode && (
              <Suspense fallback={
                <section className="space-y-2">
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">Railroad Diagram</label>
                  <div className="bg-zinc-900 border border-zinc-800 rounded p-3 min-h-[120px] overflow-x-auto">
                    <div className="flex items-center justify-center h-[120px] text-zinc-500 text-xs">Loading diagram…</div>
                  </div>
                </section>
              }>
                <RegexVisualizer pattern={pattern} regexOk={regex.ok} />
              </Suspense>
            )}

            <SavedPatterns onSelect={selectSavedPattern} />

            <TestCases
              regex={{ ok: regex.ok }}
              testStr={testStr}
              matches={matches}
              selectedPatternId={selectedPatternId}
              onSelectPattern={setSelectedPatternId}
            />

            <TestCaseRunner
              regex={regex}
              pattern={pattern}
              flags={flags}
              testCases={getSavedPatterns().find(p => p.id === selectedPatternId)?.testCases ?? []}
              onLoadTestCase={tc => setTestStr(tc.testStr)}
            />

            {/* Stats */}
            <section className="space-y-1.5">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Stats</label>
              <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Pattern</span>
                  <span className="text-zinc-300">{pattern.length} chars</span>
                </div>
                <div className="flex justify-between">
                  <span>Test string</span>
                  <span className="text-zinc-300">{testStr.length} chars, {testStr.split('\n').length} lines</span>
                </div>
                {matches && (
                  <>
                    <div className="flex justify-between">
                      <span>Matches</span>
                      <span className="text-cyan-300">{matches.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exec time</span>
                      <span className="text-zinc-300">{execTime}ms</span>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Quick reference sidebar */}
            <section className="space-y-1.5">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Quick Reference</label>
              <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs space-y-1">
                {[
                  ['\\d', 'digit'],
                  ['\\w', 'word'],
                  ['\\s', 'space'],
                  ['.', 'any'],
                  ['*', '0+'],
                  ['+', '1+'],
                  ['?', 'opt'],
                  ['|', 'OR'],
                ].map(([tok, desc]) => (
                  <div key={tok} className="flex justify-between">
                    <code className="text-amber-300 font-mono">{tok}</code>
                    <span className="text-zinc-500">{desc}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setCheatOpen(true)}
                className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors mt-1"
              >
                Full cheat sheet →
              </button>
            </section>

            <BenchmarkMode
              regex={regex}
              pattern={pattern}
              flags={flags}
              testStr={testStr}
              replaceMode={replaceMode}
            />
          </div>
        </div>

        <footer className="mt-8 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-700">
          <span>RegexCraft</span>
          <span className="hidden sm:inline">⌘K focus pattern · ⌘L focus test · Esc close</span>
          <span>React + TypeScript + Vite + Tailwind v4</span>
          <span>Zero regex libs — pure JS RegExp</span>
        </footer>
      </main>

      <CheatSheet
        open={cheatOpen}
        onClose={() => setCheatOpen(false)}
        onSelectPattern={selectPattern}
      />
    </div>
  )
}