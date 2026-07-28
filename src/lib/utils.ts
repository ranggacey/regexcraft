import type { SavedPattern, TestCase } from '../types'

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
    
    // Escape sequences
    if (token === '\\' && i + 1 < pattern.length) {
      const next = pattern[i + 1]
      token += next
      i++
      
      // Handle \xNN, \uNNNN, \u{NNNNNN}
      if (next === 'x' && i + 2 < pattern.length) {
        token += pattern[i + 1] + pattern[i + 2]
        i += 2
      } else if (next === 'u' && i + 1 < pattern.length) {
        if (pattern[i + 1] === '{') {
          // \u{NNNNNN}
          let j = i + 2
          while (j < pattern.length && pattern[j] !== '}') j++
          if (j < pattern.length) {
            token += pattern.slice(i + 1, j + 1)
            i = j
          }
        } else if (i + 4 < pattern.length) {
          // \uNNNN
          token += pattern.slice(i + 1, i + 5)
          i += 4
        }
      }
    }
    
    // Character classes [...]
    else if (token === '[') {
      let j = i + 1
      let inEscape = false
      while (j < pattern.length) {
        if (pattern[j] === '\\' && !inEscape) {
          inEscape = true
        } else if (pattern[j] === ']' && !inEscape) {
          break
        } else {
          inEscape = false
        }
        j++
      }
      if (j < pattern.length) {
        token = pattern.slice(i, j + 1)
        i = j
      }
    }
    
    // Quantifiers {n,m}
    else if (token === '{') {
      let j = i + 1
      while (j < pattern.length && pattern[j] !== '}') j++
      if (j < pattern.length) {
        token = pattern.slice(i, j + 1)
        i = j
      }
    }
    
    // Group constructs (?:), (?=), (?!), (?<=), (?<!), (?>), (?#), (?<name>), (?P<name>)
    else if (token === '(' && i + 1 < pattern.length && pattern[i + 1] === '?') {
      let j = i + 2
      if (pattern[j] === '<') {
        // Named group or lookbehind
        while (j < pattern.length && pattern[j] !== '>') j++
        if (j < pattern.length) j++
      } else if (pattern[j] === 'P' && pattern[j + 1] === '<') {
        // Python-style named group (?P<name>)
        j += 2
        while (j < pattern.length && pattern[j] !== '>') j++
        if (j < pattern.length) j++
      } else {
        // (?:), (?=), (?!), (?>), (?#)
        while (j < pattern.length && pattern[j] !== ')') j++
        if (j < pattern.length) j++
      }
      if (j > i) {
        token = pattern.slice(i, j)
        i = j - 1
      }
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
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    // Migration: add testCases and updatedAt to old patterns
    return data.map((p: any) => ({
      ...p,
      testCases: p.testCases || [],
      updatedAt: p.updatedAt || p.createdAt,
    }))
  } catch {
    return []
  }
}

export function savePattern(name: string, pattern: string, flags: string, testCases: TestCase[] = []): SavedPattern {
  const patterns = getSavedPatterns()
  const now = Date.now()
  const sp: SavedPattern = {
    id: crypto.randomUUID(),
    name,
    pattern,
    flags,
    testCases,
    createdAt: now,
    updatedAt: now,
  }
  patterns.unshift(sp)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns.slice(0, 20)))
  return sp
}

export function updateSavedPattern(id: string, updates: Partial<SavedPattern>): void {
  const patterns = getSavedPatterns().map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns))
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
    const migrated = data.map((item: any) => ({
      ...item,
      testCases: item.testCases || [],
      updatedAt: item.updatedAt || item.createdAt,
    }))
    const merged = [...migrated, ...existing].slice(0, 50)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    return { count: data.length }
  } catch {
    return { count: 0, error: 'Invalid JSON' }
  }
}

// Test case helpers
export function addTestCase(patternId: string, name: string, testStr: string, expectedMatches?: string[]): TestCase | null {
  const patterns = getSavedPatterns()
  const idx = patterns.findIndex(p => p.id === patternId)
  if (idx === -1) return null
  const tc: TestCase = {
    id: crypto.randomUUID(),
    name,
    testStr,
    expectedMatches,
    createdAt: Date.now(),
  }
  patterns[idx].testCases.push(tc)
  patterns[idx].updatedAt = Date.now()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns))
  return tc
}

export function updateTestCase(patternId: string, testCaseId: string, updates: Partial<TestCase>): void {
  const patterns = getSavedPatterns()
  const pIdx = patterns.findIndex(p => p.id === patternId)
  if (pIdx === -1) return
  const tcIdx = patterns[pIdx].testCases.findIndex(tc => tc.id === testCaseId)
  if (tcIdx === -1) return
  patterns[pIdx].testCases[tcIdx] = { ...patterns[pIdx].testCases[tcIdx], ...updates }
  patterns[pIdx].updatedAt = Date.now()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns))
}

export function deleteTestCase(patternId: string, testCaseId: string): void {
  const patterns = getSavedPatterns()
  const pIdx = patterns.findIndex(p => p.id === patternId)
  if (pIdx === -1) return
  patterns[pIdx].testCases = patterns[pIdx].testCases.filter(tc => tc.id !== testCaseId)
  patterns[pIdx].updatedAt = Date.now()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns))
}

const EXPLAIN_MAP: Record<string, string> = {
  // Anchors
  '^': 'start of string/line (with m flag)',
  '$': 'end of string/line (with m flag)',
  '\\A': 'start of string',
  '\\z': 'end of string',
  '\\Z': 'end of string (before final newline)',
  '\\b': 'word boundary',
  '\\B': 'non-word boundary',
  // Character classes
  '.': 'any character (except newline, unless s flag)',
  '\\d': 'digit [0-9]',
  '\\D': 'non-digit',
  '\\w': 'word character [a-zA-Z0-9_]',
  '\\W': 'non-word character',
  '\\s': 'whitespace',
  '\\S': 'non-whitespace',
  // Quantifiers
  '*': '0 or more (greedy)',
  '+': '1 or more (greedy)',
  '?': '0 or 1 (optional)',
  '*?': '0 or more (lazy)',
  '+?': '1 or more (lazy)',
  '??': '0 or 1 (lazy)',
  // Groups & alternation
  '(': 'capturing group start',
  ')': 'group end',
  '(?:': 'non-capturing group',
  '(?=': 'positive lookahead',
  '(?!': 'negative lookahead',
  '(?<=': 'positive lookbehind',
  '(?<!': 'negative lookbehind',
  '(?>': 'atomic group',
  '(?#': 'comment group',
  '|': 'alternation (OR)',
  // Backreferences
  '\\1': 'backreference to group 1',
  '\\2': 'backreference to group 2',
  '\\3': 'backreference to group 3',
  '\\4': 'backreference to group 4',
  '\\5': 'backreference to group 5',
  '\\6': 'backreference to group 6',
  '\\7': 'backreference to group 7',
  '\\8': 'backreference to group 8',
  '\\9': 'backreference to group 9',
  // Character class
  '[': 'character class start',
  ']': 'character class end',
  '[^': 'negated character class',
  // Quantifier braces
  '{': 'quantifier start',
  '}': 'quantifier end',
  // Control characters
  '\\t': 'tab',
  '\\n': 'newline',
  '\\r': 'carriage return',
  '\\f': 'form feed',
  '\\v': 'vertical tab',
  '\\0': 'null character',
  // Unicode properties (with u flag)
  '\\p{': 'Unicode property',
  '\\P{': 'negated Unicode property',
}
