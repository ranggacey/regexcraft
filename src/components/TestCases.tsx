import { useState, useEffect, useCallback } from 'react'
import type { SavedPattern, TestCase } from '../types'
import { getSavedPatterns, addTestCase, deleteTestCase } from '../lib/utils'

interface Props {
  regex: { ok: boolean }
  testStr: string
  matches: { length: number } | null
  selectedPatternId: string | null
  onSelectPattern: (id: string | null) => void
}

export default function TestCases({ regex, testStr, matches, selectedPatternId, onSelectPattern }: Props) {
  const [patterns, setPatterns] = useState<SavedPattern[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTestStr, setNewTestStr] = useState(testStr)

  useEffect(() => { setPatterns(getSavedPatterns()) }, [])

  const refresh = useCallback(() => setPatterns(getSavedPatterns()), [])

  const handleAddTestCase = () => {
    if (!selectedPatternId || !newName.trim() || !newTestStr.trim()) return
    addTestCase(selectedPatternId, newName.trim(), newTestStr)
    setNewName('')
    setNewTestStr(testStr)
    setShowAdd(false)
    refresh()
  }

  const handleLoadTestCase = useCallback((tc: TestCase) => {
    navigator.clipboard?.writeText(tc.testStr)
    alert(`Copied test string: ${tc.name}`)
  }, [])

  const handleDeleteTestCase = (patternId: string, testCaseId: string) => {
    if (!confirm('Delete this test case?')) return
    deleteTestCase(patternId, testCaseId)
    refresh()
  }

  const selectedPattern = patterns.find(p => p.id === selectedPatternId)

  return (
    <section className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Test Cases</label>
        <button
          onClick={() => { setShowAdd(s => !s); if (!selectedPatternId && patterns[0]) onSelectPattern(patterns[0].id) }}
          className={`text-[10px] transition-colors ${showAdd ? 'text-cyan-400' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          {showAdd ? 'Cancel' : '+ Add'}
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 space-y-2">
        {patterns.length === 0 ? (
          <p className="text-[10px] text-zinc-600 italic">Save a pattern first to add test cases</p>
        ) : (
          <>
            <select
              value={selectedPatternId || ''}
              onChange={e => onSelectPattern(e.target.value || null)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs outline-none focus:border-cyan-500 transition-colors text-zinc-100"
            >
              <option value="" disabled>Select a saved pattern…</option>
              {patterns.map(p => (
                <option key={p.id} value={p.id}>{p.name} (/{p.pattern}/{p.flags})</option>
              ))}
            </select>

            {selectedPattern && (
              <>
                {showAdd && (
                  <div className="space-y-1.5 border-t border-zinc-800 pt-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="Test case name…"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs outline-none focus:border-cyan-500 transition-colors"
                    />
                    <textarea
                      value={newTestStr}
                      onChange={e => setNewTestStr(e.target.value)}
                      placeholder="Test string…"
                      rows={3}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs font-mono outline-none focus:border-cyan-500 transition-colors resize-none"
                    />
                    <button
                      onClick={handleAddTestCase}
                      className="w-full px-2 py-1 text-xs rounded bg-cyan-900/50 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 transition-colors"
                    >
                      Add Test Case
                    </button>
                  </div>
                )}

                {selectedPattern.testCases.length > 0 && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {selectedPattern.testCases.map(tc => (
                      <div key={tc.id} className="flex items-start gap-1.5 bg-zinc-800/50 rounded px-2 py-1.5">
                        <button
                          onClick={() => handleLoadTestCase(tc)}
                          className="flex-1 text-left min-w-0"
                          title="Copy test string"
                        >
                          <span className="text-xs text-zinc-300 truncate block">{tc.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono truncate block">{tc.testStr.slice(0, 60)}{tc.testStr.length > 60 ? '…' : ''}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTestCase(selectedPattern!.id, tc.id)}
                          className="text-zinc-600 hover:text-red-400 text-xs shrink-0"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPattern.testCases.length === 0 && !showAdd && (
                  <p className="text-[10px] text-zinc-600 italic">No test cases yet. Click + Add to create one.</p>
                )}
              </>
            )}
          </>
        )}
      </div>

      {matches && regex.ok && (
        <p className="text-[10px] text-zinc-600">
          Current: {matches.length} match{matches.length !== 1 ? 'es' : ''} in test string
        </p>
      )}
    </section>
  )
}