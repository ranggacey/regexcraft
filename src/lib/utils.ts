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
