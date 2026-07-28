import { useState, useCallback } from 'react'
import type { RegexResult } from '../types'

interface Props {
  regex: RegexResult
  pattern: string
  flags: string
  testStr: string
  replaceMode: boolean
}

export default function BenchmarkMode({ regex, pattern, flags, testStr, replaceMode }: Props) {
  const [iterations, setIterations] = useState(1000)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<BenchmarkResult | null>(null)

  const runBenchmark = useCallback(async () => {
    if (!regex.ok || !testStr || running) return
    setRunning(true)
    setResults(null)

    const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')

    // Warmup
    for (let i = 0; i < 10; i++) {
      testStr.replace(re, '')
    }

    const start = performance.now()
    for (let i = 0; i < iterations; i++) {
      testStr.replace(re, '')
    }
    const end = performance.now()

    const totalMs = end - start
    const opsPerSec = Math.round((iterations / totalMs) * 1000)
    const nsPerOp = Math.round((totalMs / iterations) * 1_000_000)

    setResults({ totalMs, opsPerSec, nsPerOp, iterations })
    setRunning(false)
  }, [regex.ok, pattern, flags, testStr, iterations, running])

  if (replaceMode) return null

  return (
    <section className="space-y-1.5">
      <label className="text-xs text-zinc-500 uppercase tracking-wider">Benchmark</label>
      <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 space-y-2">
        {regex.ok && testStr ? (
          <>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={iterations}
                onChange={e => setIterations(Math.max(100, Math.min(100000, Number(e.target.value))))}
                min={100}
                max={100000}
                className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs outline-none focus:border-cyan-500 text-center"
              />
              <span className="text-xs text-zinc-500">iterations</span>
              <button
                onClick={runBenchmark}
                disabled={running}
                className="ml-auto px-3 py-1 text-xs rounded bg-cyan-900/50 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {running ? '⏳ Running…' : '▶ Run'}
              </button>
            </div>

            {results && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-800/50 rounded px-2 py-1.5">
                  <div className="text-zinc-500">Total time</div>
                  <div className="text-cyan-300 font-mono">{results.totalMs.toFixed(2)} ms</div>
                </div>
                <div className="bg-zinc-800/50 rounded px-2 py-1.5">
                  <div className="text-zinc-500">Per iteration</div>
                  <div className="text-cyan-300 font-mono">{results.nsPerOp} ns</div>
                </div>
                <div className="bg-zinc-800/50 rounded px-2 py-1.5">
                  <div className="text-zinc-500">Throughput</div>
                  <div className="text-cyan-300 font-mono">{results.opsPerSec.toLocaleString()} ops/s</div>
                </div>
                <div className="bg-zinc-800/50 rounded px-2 py-1.5">
                  <div className="text-zinc-500">Iterations</div>
                  <div className="text-zinc-300 font-mono">{results.iterations}</div>
                </div>
              </div>
            )}

            <p className="text-[10px] text-zinc-600">
              Measures RegExp replace throughput. Warmup runs excluded. Results vary by JS engine.
            </p>
          </>
        ) : (
          <p className="text-xs text-zinc-600 italic">Enter valid pattern & test string to benchmark</p>
        )}
      </div>
    </section>
  )
}

interface BenchmarkResult {
  totalMs: number
  opsPerSec: number
  nsPerOp: number
  iterations: number
}