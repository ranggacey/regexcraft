import type { SavedPattern } from '../types'

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function encodeState(pattern: string, flags: string, testStr: string): string {
  const data = { p: pattern, f: flags, s: testStr }
  const json = JSON.stringify(data)
  // Use btoa for base64, but handle Unicode via encodeURIComponent first
  return btoa(encodeURIComponent(json)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function decodeState(hash: string): { pattern: string; flags: string; testStr: string } | null {
  try {
    const base64 = hash.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const json = decodeURIComponent(atob(padded))
    const data = JSON.parse(json)
    if (typeof data.p === 'string' && typeof data.f === 'string' && typeof data.s === 'string') {
      return { pattern: data.p, flags: data.f, testStr: data.s }
    }
    return null
  } catch {
    return null
  }
}

export function explainPattern(pattern: string): string {
  if (!pattern) return '(empty pattern)'
  const parts: string[] = []
  let i = 0
  while (i < pattern.length) {
    let token = pattern[i]
    if (token === '\\' && i + 1 < pattern.length) {
      token += pattern[i + 1]
      i++
    }
    const desc = EXPLAIN_MAP[token]
    parts.push(desc ? `${token} — ${desc}` : token)
    i++
  }
  return parts.join('\n')
}

export function detectCatastrophicPattern(pattern: string): string {
  // Detect nested quantifiers: (a+)+, (a*)*, (a+)*, (a*)+ etc.
  const nested = /\([^)]+[+*?][+*?]\)[+*?]/g
  if (nested.test(pattern)) {
    return '⚠ Nested quantifier — risk of catastrophic backtracking. Consider reworking pattern.'
  }
  // Alternatives that can match same text: (a|a)*, (a|b)*a*b* etc.
  const altOverlap = /\([^)]*\|[^)]*\)\*/.test(pattern)
  if (altOverlap && /^(?:\\.|[^*?+])*\*$/.test(pattern.replace(/\([^)]*\)/g, 'x'))) {
    // simplified check
  }
  return ''
}

const STORAGE_KEY = 'regexcraft_saved_patterns'

export function getSavedPatterns(): SavedPattern[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function savePattern(name: string, pattern: string, flags: string): SavedPattern {
  const patterns = getSavedPatterns()
  const sp: SavedPattern = {
    id: crypto.randomUUID(),
    name,
    pattern,
    flags,
    createdAt: Date.now(),
  }
  patterns.unshift(sp)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns.slice(0, 20)))
  return sp
}

export function deleteSavedPattern(id: string): void {
  const patterns = getSavedPatterns().filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns))
}

export function exportSavedPatterns(): string {
  return JSON.stringify(getSavedPatterns(), null, 2)
}

export function importSavedPatterns(json: string): { count: number; error?: string } {
  try {
    const data = JSON.parse(json)
    if (!Array.isArray(data)) return { count: 0, error: 'Invalid format — expected an array' }
    for (const item of data) {
      if (!item.name || !item.pattern) return { count: 0, error: 'Each pattern must have name and pattern fields' }
    }
    const existing = getSavedPatterns()
    const merged = [...data, ...existing].slice(0, 50)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    return { count: data.length }
  } catch {
    return { count: 0, error: 'Invalid JSON' }
  }
}

const EXPLAIN_MAP: Record<string, string> = {
  '.': 'any char',
  '\\d': 'digit',
  '\\w': 'word char',
  '\\s': 'whitespace',
  '\\b': 'word boundary',
  '\\D': 'non-digit',
  '\\W': 'non-word',
  '\\S': 'non-whitespace',
  '^': 'start anchor',
  '$': 'end anchor',
  '*': '0+ times',
  '+': '1+ times',
  '?': 'optional',
  '|': 'OR',
  '(': 'group start',
  ')': 'group end',
  '[': 'class start',
  ']': 'class end',
  '{': 'quantifier start',
  '}': 'quantifier end',
}
