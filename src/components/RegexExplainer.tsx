import { explainPattern } from '../lib/utils'

interface Props {
  pattern: string
  regexOk: boolean
}

export default function RegexExplainer({ pattern, regexOk }: Props) {
  if (!pattern || !regexOk) return null

  const explanation = explainPattern(pattern)

  return (
    <section className="space-y-1.5">
      <label className="text-xs text-zinc-500 uppercase tracking-wider">Explanation</label>
      <div className="bg-zinc-900 border border-zinc-700/50 rounded px-3 py-2 text-xs font-mono whitespace-pre-wrap text-zinc-400">
        {explanation}
      </div>
    </section>
  )
}
