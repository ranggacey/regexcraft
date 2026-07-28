import type { MatchResult } from '../types'

interface Props {
  matches: MatchResult[] | null
}

export default function MatchDetails({ matches }: Props) {
  if (!matches || matches.length === 0) return null

  return (
    <section className="space-y-1.5">
      <label className="text-xs text-zinc-500 uppercase tracking-wider">Details</label>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {matches.map((m, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono">
            <span className="text-zinc-500">#{i + 1} </span>
            <span className="text-cyan-300">&ldquo;{m.full}&rdquo;</span>
            <span className="text-zinc-600"> at {m.index}</span>
            {m.groups.length > 0 && (
              <span className="ml-2 text-zinc-400">
                → groups: [{m.groups.map((g, j) => (
                  <span key={j} className={g ? 'text-green-300' : 'text-zinc-600'}>
                    {j > 0 ? ', ' : ''}&ldquo;{g ?? 'undefined'}&rdquo;
                  </span>
                ))}]
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
