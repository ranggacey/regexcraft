import { useState } from 'react'
import type { MatchResult } from '../types'

interface Props {
  matches: MatchResult[] | null
  hasIndices?: boolean
}

export default function MatchDetails({ matches, hasIndices }: Props) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  if (!matches || matches.length === 0) return null

  const handleCopy = (text: string, i: number) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedIdx(i)
      setTimeout(() => setCopiedIdx(null), 1200)
    })
  }

  return (
    <section className="space-y-1.5">
      <label className="text-xs text-zinc-500 uppercase tracking-wider">Details</label>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {matches.map((m, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-zinc-500">#{i + 1} </span>
              <span className="text-cyan-300">&ldquo;{m.full}&rdquo;</span>
              <span className="text-zinc-600"> at {m.index}</span>
              {hasIndices && m.indices && (
                <>
                  <span className="text-zinc-600 ml-2">[{m.indices[0][0]}, {m.indices[0][1]})</span>
                  {m.indices.slice(1).map((g, gi) => (
                    <span key={gi} className="text-zinc-600 ml-1">
                      [{g[0] === -1 ? '?' : g[0]}, {g[1] === -1 ? '?' : g[1]})
                    </span>
                  ))}
                </>
              )}
              {m.groups.length > 0 && (
                <span className="ml-2 text-zinc-400">
                  &rarr; groups: [{m.groups.map((g, j) => (
                    <span key={j} className={g ? 'text-green-300' : 'text-zinc-600'}>
                      {j > 0 ? ', ' : ''}&ldquo;{g ?? 'undefined'}&rdquo;
                    </span>
                  ))}]</span>
              )}
            </div>
            <button
              onClick={() => handleCopy(m.full, i)}
              className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors text-[10px] px-1"
              title="Copy match text"
            >
              {copiedIdx === i ? '✓' : '📋'}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}