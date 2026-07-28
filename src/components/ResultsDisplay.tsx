import type { MatchResult } from '../types'
import { escapeHtml } from '../lib/utils'

interface Props {
  matches: MatchResult[] | null
  testStr: string
  regexOk: boolean
  replaceOutput?: string | null
  replaceMode?: boolean
}

export default function ResultsDisplay({ matches, testStr, regexOk, replaceOutput, replaceMode }: Props) {
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

  const highlighted = buildHighlighted(testStr, matches)

  return (
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
        dangerouslySetInnerHTML={{ __html: highlighted || escapeHtml(testStr) }}
      />
    </section>
  )
}

function buildHighlighted(testStr: string, matches: MatchResult[] | null): string {
  if (!matches?.length) return ''
  let result = ''
  let last = 0
  for (const m of matches) {
    result += escapeHtml(testStr.slice(last, m.index))
    result += `<mark class="bg-yellow-300/40 text-yellow-100 rounded px-0.5">${escapeHtml(m.full)}</mark>`
    last = m.index + m.full.length
  }
  result += escapeHtml(testStr.slice(last))
  return result
}
