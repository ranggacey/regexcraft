export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
