import { useState, useMemo } from 'react'

function App() {
  const [pattern, setPattern] = useState('(\\w+)@(\\w+\\.\\w+)')
  const [flags, setFlags] = useState('gi')
  const [testStr, setTestStr] = useState(`hello@example.com
user@domain.org
not-an-email@`)
  const [copyOk, setCopyOk] = useState(false)

  const regex = useMemo(() => {
    try {
      return { ok: true as const, re: new RegExp(pattern, flags), error: null }
    } catch (e) {
      return { ok: false as const, re: null, error: (e as Error).message }
    }
  }, [pattern, flags])

  const matches = useMemo(() => {
    if (!regex.ok || !testStr) return null
    const ms: { full: string; groups: (string | undefined)[]; index: number }[] = []
    const re = new RegExp(regex.re.source, regex.re.flags.includes('g') ? regex.re.flags : regex.re.flags + 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(testStr)) !== null) {
      const groups = []
      for (let i = 1; i < m.length; i++) groups.push(m[i])
      ms.push({ full: m[0], groups, index: m.index })
      if (!re.global) break
    }
    return ms
  }, [regex, testStr])

  const highlighted = useMemo(() => {
    if (!regex.ok || !testStr || !matches?.length) return testStr
    let result = ''
    let last = 0
    for (const m of matches) {
      result += escapeHtml(testStr.slice(last, m.index))
      result += `<mark class="bg-yellow-300/40 text-yellow-100 rounded px-0.5">${escapeHtml(m.full)}</mark>`
      last = m.index + m.full.length
    }
    result += escapeHtml(testStr.slice(last))
    return result
  }, [regex.ok, testStr, matches])

  function toggleFlag(f: string) {
    setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)
  }

  function copyRegex() {
    navigator.clipboard?.writeText(`/${pattern}/${flags}`).then(() => {
      setCopyOk(true)
      setTimeout(() => setCopyOk(false), 1500)
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono">
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <span className="text-xl">🔧</span>
        <h1 className="text-lg font-bold tracking-tight">RegexCraft</h1>
        <span className="text-xs text-zinc-500">— interactive regex tester</span>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Pattern input */}
        <section className="space-y-1.5">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Pattern</label>
          <div className="flex gap-2">
            <span className="text-zinc-500 self-center text-lg">/</span>
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="regex pattern"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors font-mono"
              spellCheck={false}
            />
            <span className="text-zinc-500 self-center text-lg">/</span>
            <input
              type="text"
              value={flags}
              onChange={e => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))}
              className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-2 text-sm outline-none focus:border-cyan-500 transition-colors text-center"
              spellCheck={false}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['g', 'i', 'm', 's', 'u', 'y'].map(f => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                  flags.includes(f)
                    ? 'bg-cyan-900/50 border-cyan-600 text-cyan-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500'
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={copyRegex}
              className="ml-auto px-2 py-0.5 text-xs rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {copyOk ? '✓ copied' : '📋 copy'}
            </button>
          </div>
          {!regex.ok && (
            <p className="text-red-400 text-xs">⚠ {regex.error}</p>
          )}
        </section>

        {/* Test string */}
        <section className="space-y-1.5">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Test String</label>
          <textarea
            value={testStr}
            onChange={e => setTestStr(e.target.value)}
            rows={6}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors font-mono resize-y"
            spellCheck={false}
          />
        </section>

        {/* Results */}
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Matches</label>
            {matches && (
              <span className="text-xs text-zinc-500">
                {matches.length} match{matches.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
          <div
            className="w-full min-h-[80px] bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm font-mono whitespace-pre-wrap break-all"
            dangerouslySetInnerHTML={{ __html: highlighted || testStr || <span className="text-zinc-600">no input</span> as any }}
          />
        </section>

        {/* Match details */}
        {matches && matches.length > 0 && (
          <section className="space-y-1.5">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Details</label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {matches.map((m, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs">
                  <span className="text-zinc-500">#{i + 1} </span>
                  <span className="text-cyan-300">"{m.full}"</span>
                  <span className="text-zinc-600"> at {m.index}</span>
                  {m.groups.length > 0 && (
                    <span className="ml-2 text-zinc-400">
                      → groups: [{m.groups.map((g, j) => (
                        <span key={j} className={g ? 'text-green-300' : 'text-zinc-600'}>
                          {j > 0 ? ', ' : ''}"{g ?? 'undefined'}"
                        </span>
                      ))}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="text-[10px] text-zinc-700 text-center pt-2">
          RegexCraft — built with React + TypeScript + Tailwind v4
        </p>
      </main>
    </div>
  )
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default App
