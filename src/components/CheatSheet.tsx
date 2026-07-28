import { COMMON_PATTERNS, SYNTAX_REFERENCE } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  onSelectPattern: (p: string) => void
}

export default function CheatSheet({ open, onClose, onSelectPattern }: Props) {
  if (!open) return null

  // Group patterns by category
  const patternsByCategory = COMMON_PATTERNS.reduce((acc, p) => {
    const cat = p.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {} as Record<string, typeof COMMON_PATTERNS>)

  const categories = Object.keys(patternsByCategory).sort()

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold tracking-tight">📖 Regex Cheat Sheet</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 text-lg leading-none">&times;</button>
        </div>

        <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Common Patterns</h3>
        <div className="space-y-4 mb-5">
          {categories.map((cat, ci) => (
            <div key={ci}>
              <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">{cat}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {patternsByCategory[cat].map((p, i) => (
                  <button
                    key={`${cat}-${i}`}
                    onClick={() => { onSelectPattern(p.pattern); onClose() }}
                    className="text-left bg-zinc-800/50 hover:bg-zinc-800 rounded px-2.5 py-1.5 text-xs transition-colors group"
                  >
                    <code className="text-cyan-300 font-mono text-[11px]">/{p.pattern}/</code>
                    <span className="block text-zinc-500 text-[10px] mt-0.5">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Syntax Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
          {SYNTAX_REFERENCE.map((s, i) => (
            <div key={i} className="flex gap-2 items-center bg-zinc-800/30 rounded px-2 py-1 text-xs">
              <code className="text-amber-300 font-mono bg-zinc-800 rounded px-1">{s.token}</code>
              <span className="text-zinc-400 text-[10px]">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
