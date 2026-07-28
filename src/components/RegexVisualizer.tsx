import { useEffect, useRef, useState } from 'react'
import { render } from '@regexper/render'

interface Props {
  pattern: string
  regexOk: boolean
}

export default function RegexVisualizer({ pattern, regexOk }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pattern || !regexOk || !svgRef.current) return
    setRendering(true)
    setError(null)

    const svg = svgRef.current
    svg.innerHTML = ''

    render(pattern, svg)
      .then(() => setRendering(false))
      .catch((e) => {
        setError(e.message ?? 'Failed to render regex')
        setRendering(false)
      })
  }, [pattern, regexOk])

  return (
    <section className="space-y-2">
      <label className="text-xs text-zinc-500 uppercase tracking-wider">Railroad Diagram</label>
      <div className="bg-zinc-900 border border-zinc-800 rounded p-3 min-h-[120px] overflow-x-auto">
        {rendering && (
          <div className="flex items-center justify-center h-[120px] text-zinc-500 text-xs">
            Rendering diagram…
          </div>
        )}
        {error && (
          <div className="text-xs text-red-400 text-center py-4">{error}</div>
        )}
        {!rendering && !error && (
          <svg
            ref={svgRef}
            className="block"
            style={{ minWidth: '100%', minHeight: '120px' }}
          />
        )}
        {!pattern && (
          <div className="flex items-center justify-center h-[120px] text-zinc-600 text-xs">
            Enter a regex pattern to see the railroad diagram
          </div>
        )}
        {!regexOk && pattern && !error && (
          <div className="text-xs text-amber-400 text-center py-4">
            Invalid regex — fix pattern to see diagram
          </div>
        )}
      </div>
    </section>
  )
}