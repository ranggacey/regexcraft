import type { MatchResult } from '../types'
import { escapeHtml } from '../lib/utils'

interface Props {
  matches: MatchResult[] | null
  testStr: string
  regexOk: boolean
  replaceOutput?: string | null
  replaceMode?: boolean
  matchIndex?: number
  onMatchIndexChange?: (index: number) => void
}

export default function ResultsDisplay({ matches, testStr, regexOk, replaceOutput, replaceMode, matchIndex = 0, onMatchIndexChange }: Props) {
  const hasMatches = matches && matches.length > 0
  const canNavigate = hasMatches && matches.length > 1

  const goPrev = () => {
    if (canNavigate && onMatchIndexChange) {
      onMatchIndexChange(matchIndex > 0 ? matchIndex - 1 : matches.length - 1)
    }
  }

  const goNext = () => {
    if (canNavigate && onMatchIndexChange) {
      onMatchIndexChange(matchIndex < matches.length - 1 ? matchIndex + 1 : 0)
    }
  }

  if (replaceMode && replaceOutput !== null) {
    return (
      <section className="space-y-1.5">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Result</label>
        <div className="w-full min-h-[80px] bg-zinc-900 border border-green-700/40 rounded px-3 py-2 text-sm font-mono whitespace-pre-wrap break-all">
          {replaceOutput}
        </div>
      </section>
    )
  }

  if (!regexOk || !testStr) {
    return (
      <section className="space-y-1.5">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Matches</label>
        <div className="w-full min-h-[80px] bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm font-mono whitespace-pre-wrap break-all text-zinc-600">
          {testStr ? '' : 'no input'}
        </div>
      </section>
    )
  }

  const highlighted = buildHighlighted(testStr, matches, matchIndex)

  return (
    <section className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Matches</label>
        {matches && (
          <div className="flex items-center gap-2">
            {canNavigate && (
              <div className="flex items-center gap-1">
                <button
                  onClick={goPrev}
                  className="px-1.5 py-0.5 text-xs rounded bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Previous match"
                >
                  ←
                </button>
                <span className="text-xs text-zinc-500 font-mono">
                  {matchIndex + 1}/{matches.length}
                </span>
                <button
                  onClick={goNext}
                  className="px-1.5 py-0.5 text-xs rounded bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Next match"
                >
                  →
                </button>
              </div>
            )}
            <span className="text-xs text-zinc-500">
              {matches.length} match{matches.length !== 1 ? 'es' : ''}
            </span>
          </div>
        )}
      </div>
      <div
        className="w-full min-h-[80px] bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm font-mono whitespace-pre-wrap break-all"
        dangerouslySetInnerHTML={{ __html: highlighted || escapeHtml(testStr) }}
      />
    </section>
  )
}

function buildHighlighted(testStr: string, matches: MatchResult[] | null, activeIndex: number = -1): string {
  if (!matches?.length) return ''
  let result = ''
  let last = 0
  matches.forEach((m, idx) => {
    result += escapeHtml(testStr.slice(last, m.index))
    const isActive = idx === activeIndex
    result += `<mark class="${isActive ? 'bg-cyan-400/60 text-white ring-2 ring-cyan-300' : 'bg-yellow-300/40 text-yellow-100'} rounded px-0.5">${escapeHtml(m.full)}</mark>`
    last = m.index + m.full.length
  })
  result += escapeHtml(testStr.slice(last))
  return result
}
