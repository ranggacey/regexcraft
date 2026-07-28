import { useState, useEffect, useCallback, useRef } from 'react'
import type { SavedPattern } from '../types'
import { getSavedPatterns, savePattern, deleteSavedPattern, exportSavedPatterns, importSavedPatterns } from '../lib/utils'

interface Props {
  onSelect: (pattern: string, flags: string) => void
}

export default function SavedPatterns({ onSelect }: Props) {
  const [patterns, setPatterns] = useState<SavedPattern[]>([])
  const [showSave, setShowSave] = useState(false)
  const [name, setName] = useState('')
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('')
  const [importMsg, setImportMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(() => setPatterns(getSavedPatterns()), [])

  useEffect(() => { refresh() }, [refresh])

  const handleSave = () => {
    if (!name.trim() || !pattern.trim()) return
    savePattern(name.trim(), pattern, flags)
    setName('')
    setPattern('')
    setFlags('')
    setShowSave(false)
    refresh()
  }

  const handleDelete = (id: string) => {
    deleteSavedPattern(id)
    refresh()
  }

  return (
    <section className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Saved Patterns</label>
        <button
          onClick={() => setShowSave(s => !s)}
          className="text-[10px] text-cyan-500 hover:text-cyan-400 transition-colors"
        >
          {showSave ? 'Cancel' : '+ Save'}
        </button>
      </div>

      {showSave && (
        <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 space-y-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Pattern name..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs outline-none focus:border-cyan-500 transition-colors"
          />
          <div className="flex gap-1.5">
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="/pattern/"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs font-mono outline-none focus:border-cyan-500 transition-colors"
            />
            <input
              type="text"
              value={flags}
              onChange={e => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))}
              placeholder="flags"
              className="w-12 bg-zinc-800 border border-zinc-700 rounded px-1 py-1 text-xs font-mono outline-none focus:border-cyan-500 transition-colors text-center"
            />
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs rounded bg-cyan-800/50 border border-cyan-700 text-cyan-300 hover:bg-cyan-800 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {patterns.length > 0 && (
        <div className="space-y-1 max-h-36 overflow-y-auto">
          {patterns.map(sp => (
            <div key={sp.id} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 group">
              <button
                onClick={() => { onSelect(sp.pattern, sp.flags); setShowSave(false) }}
                className="flex-1 text-left min-w-0"
              >
                <span className="text-xs text-zinc-300 truncate block">{sp.name}</span>
                <span className="text-[10px] text-zinc-500 font-mono truncate block">/{sp.pattern}/{sp.flags}</span>
              </button>
              <button
                onClick={() => handleDelete(sp.id)}
                className="text-zinc-600 hover:text-red-400 transition-colors text-xs shrink-0 opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Import/Export */}
      <div className="flex gap-1.5">
        <button
          onClick={() => {
            const json = exportSavedPatterns()
            const blob = new Blob([json], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'regexcraft-patterns.json'
            a.click()
            URL.revokeObjectURL(url)
          }}
          disabled={patterns.length === 0}
          className="flex-1 text-[10px] text-zinc-600 hover:text-zinc-400 disabled:text-zinc-800 disabled:cursor-not-allowed transition-colors"
        >
          ⬇ Export
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              const result = importSavedPatterns(reader.result as string)
              if (result.error) {
                setImportMsg(`✕ ${result.error}`)
              } else {
                setImportMsg(`✓ imported ${result.count} pattern${result.count > 1 ? 's' : ''}`)
                refresh()
              }
              setTimeout(() => setImportMsg(''), 3000)
            }
            reader.readAsText(file)
            e.target.value = ''
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          ⬆ Import
        </button>
      </div>
      {importMsg && (
        <p className="text-[10px] text-zinc-500">{importMsg}</p>
      )}

      {patterns.length === 0 && !showSave && (
        <p className="text-[10px] text-zinc-600 italic">No saved patterns yet</p>
      )}
    </section>
  )
}