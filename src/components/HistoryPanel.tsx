import { useState, useEffect } from 'react'
import { getHistory, clearHistory, type HistoryEntry } from '../lib/utils'

interface Props {
  onSelect: (pattern: string, flags: string, testStr: string) => void
}

export default function HistoryPanel({ onSelect }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setHistory(getHistory())
  }, [expanded])

  const handleSelect = (h: HistoryEntry) => {
    onSelect(h.pattern, h.flags, h.testStr)
  }

  const handleClear = () => {
    clearHistory()
    setHistory([])
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return d.toLocaleDateString()
  }

  return (
    <section className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Recent</label>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded text-xs">
        {history.length === 0 ? (
          <div className="px-3 py-2 text-zinc-500">No recent patterns</div>
        ) : (
          <>
            {history.slice(0, expanded ? 20 : 5).map(h => (
              <button
                key={h.id}
                onClick={() => handleSelect(h)}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 border-b border-zinc-800 last:border-b-0 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <code className="text-amber-300 truncate max-w-[150px]" title={h.pattern}>
                    {h.pattern}
                  </code>
                  <span className="text-zinc-600 text-[10px]">/{h.flags}</span>
                </div>
                <div className="text-zinc-500 text-[10px] mt-0.5">
                  {formatTime(h.timestamp)} · {h.testStr.length} chars
                </div>
              </button>
            ))}
            {history.length > 5 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-center px-3 py-1 text-cyan-500 hover:text-cyan-400 transition-colors"
              >
                {expanded ? 'Show less' : `Show ${history.length - 5} more`}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  )
}
