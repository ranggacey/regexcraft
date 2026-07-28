import type { RegexResult } from '../types'

interface Props {
  pattern: string
  setPattern: (v: string) => void
  flags: string
  setFlags: (v: string) => void
  regex: RegexResult
  copyOk: boolean
  onCopy: () => void
  onToggleFlag: (f: string) => void
}

const ALL_FLAGS = ['g', 'i', 'm', 's', 'u', 'y', 'd'] as const

export default function PatternInput({ pattern, setPattern, flags, setFlags, regex, copyOk, onCopy, onToggleFlag }: Props) {
  return (
    <section className="space-y-1.5">
      <label className="text-xs text-zinc-500 uppercase tracking-wider">Pattern</label>
      <div className="flex gap-2">
        <span className="text-zinc-500 self-center text-lg select-none">/</span>
        <input
          type="text"
          value={pattern}
          onChange={e => setPattern(e.target.value)}
          placeholder="regex pattern"
          id="pattern-input"
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors font-mono"
          spellCheck={false}
        />
        <span className="text-zinc-500 self-center text-lg select-none">/</span>
        <input
          type="text"
          value={flags}
          onChange={e => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))}
          className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-2 text-sm outline-none focus:border-cyan-500 transition-colors text-center font-mono"
          spellCheck={false}
        />
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        {ALL_FLAGS.map(f => (
          <button
            key={f}
            onClick={() => onToggleFlag(f)}
            className={`px-2 py-0.5 text-xs rounded border transition-colors ${
              flags.includes(f)
                ? 'bg-cyan-900/50 border-cyan-600 text-cyan-300'
                : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500'
            }`}
            title={f === 'g' ? 'Global match' : f === 'i' ? 'Case insensitive' : f === 'm' ? 'Multiline' : f === 's' ? 'Dotall (. matches newline)' : f === 'u' ? 'Unicode' : 'Sticky'}
          >
            {f}
          </button>
        ))}
        <button
          onClick={onCopy}
          className="ml-auto px-2 py-0.5 text-xs rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Copy regex pattern"
        >
          {copyOk ? '✓ copied' : '📋 copy'}
        </button>
      </div>
      {!regex.ok && (
        <p className="text-red-400 text-xs" role="alert">⚠ {regex.error}</p>
      )}
    </section>
  )
}
