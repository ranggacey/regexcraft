import type { MatchResult } from '../types'

interface Props {
  matches: MatchResult[] | null
  activeIndex: number
}

export default function MatchGroupsViewer({ matches, activeIndex }: Props) {
  if (!matches || matches.length === 0) return null

  const active = matches[activeIndex]
  if (!active || active.groups.length === 0) return null

  return (
    <section className="space-y-1.5">
      <label className="text-xs text-zinc-500 uppercase tracking-wider">
        Capture Groups {active.groups.length > 0 && <span className="text-zinc-600">({active.groups.length})</span>}
      </label>
      <div className="bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
        <div className="grid grid-cols-4 gap-px bg-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wider">
          <div className="bg-zinc-900 px-2 py-1">Group</div>
          <div className="bg-zinc-900 px-2 py-1">Name</div>
          <div className="bg-zinc-900 px-2 py-1">Value</div>
          <div className="bg-zinc-900 px-2 py-1">Index</div>
        </div>
        {active.groups.map((g, i) => (
          <div key={i} className="grid grid-cols-4 gap-px bg-zinc-800 text-xs">
            <div className="bg-zinc-900 px-2 py-1.5 text-cyan-400 font-mono">{i + 1}</div>
            <div className="bg-zinc-900 px-2 py-1.5 text-zinc-500 font-mono">—</div>
            <div className="bg-zinc-900 px-2 py-1.5 text-emerald-300 font-mono truncate" title={g ?? ''}>
              {g ?? <span className="text-zinc-600">undefined</span>}
            </div>
            <div className="bg-zinc-900 px-2 py-1.5 text-zinc-500">
              {active.indices?.[i + 1] ? (
                <span>
                  {active.indices[i + 1][0]}–{active.indices[i + 1][1]}
                </span>
              ) : (
                <span>—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
