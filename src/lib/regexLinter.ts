/**
 * Regex syntax linter — detects common mistakes before runtime
 */

export interface LintIssue {
  type: 'error' | 'warning'
  message: string
  position: number
}

export function lintRegex(pattern: string): LintIssue[] {
  if (!pattern) return []
  
  const issues: LintIssue[] = []
  
  // Empty regex
  if (pattern.trim() === '') {
    return []
  }
  
  // Check for empty character class
  if (/\[\]/.test(pattern)) {
    issues.push({ type: 'error', message: 'Empty character class [] matches nothing', position: pattern.indexOf('[]') })
  }
  
  // Check for unclosed character class
  let inCharClass = false
  let charClassStart = -1
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '[' && (i === 0 || pattern[i-1] !== '\\')) {
      inCharClass = true
      charClassStart = i
    } else if (pattern[i] === ']' && (i === 0 || pattern[i-1] !== '\\') && inCharClass) {
      inCharClass = false
      charClassStart = -1
    }
  }
  if (inCharClass && charClassStart !== -1) {
    issues.push({ type: 'error', message: 'Unclosed character class [', position: charClassStart })
  }
  
  // Check for unclosed group
  let groupDepth = 0
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '(' && (i === 0 || pattern[i-1] !== '\\')) {
      groupDepth++
    } else if (pattern[i] === ')' && (i === 0 || pattern[i-1] !== '\\')) {
      groupDepth--
      if (groupDepth < 0) {
        issues.push({ type: 'error', message: 'Unmatched closing parenthesis )', position: i })
        groupDepth = 0
      }
    }
  }
  if (groupDepth > 0) {
    issues.push({ type: 'error', message: 'Unclosed group (', position: pattern.lastIndexOf('(') })
  }
  
  // Check for quantifier at start or after ^
  if (/^[*?]/.test(pattern)) {
    issues.push({ type: 'error', message: 'Quantifier * or ? cannot start pattern', position: 0 })
  }
  
  // Check for quantifier right after |
  let i = 0
  while (i < pattern.length) {
    if (pattern[i] === '|' && i + 1 < pattern.length && /[*?]/.test(pattern[i + 1])) {
      issues.push({ type: 'warning', message: `Quantifier after | may be unintended`, position: i + 1 })
    }
    i++
  }
  
  // Check for invalid escape sequences (not in char class)
  const invalidEscapes = /(?<!\\)\\[^\\dDWsWbBnrtfv0uxvpPLkuUynNaAcCeEgGvV()[\]{}*+?.|^$\\/#]/g
  let match
  while ((match = invalidEscapes.exec(pattern)) !== null) {
    issues.push({ type: 'warning', message: `Unknown escape sequence \\${match[0][1]}`, position: match.index })
  }
  
  // Check for dangling quantifier
  const quantAfterGroup = /\)[*+?]\??(?![*+?])/g
  while ((match = quantAfterGroup.exec(pattern)) !== null) {
    const beforeParen = pattern.slice(0, match.index).lastIndexOf('(')
    if (beforeParen !== -1 && pattern.slice(beforeParen, match.index).includes('|')) {
      issues.push({ type: 'warning', message: 'Quantifier after alternation group — may match unexpected empty strings', position: match.index })
    }
  }
  
  // Check for duplicate flags
  const flags = pattern.match(/^\(\?([a-z]*)\)/)?.[1] || ''
  const unique = new Set(flags)
  if (unique.size !== flags.length) {
    issues.push({ type: 'warning', message: 'Duplicate flags in (?...) group', position: 0 })
  }
  
  // Check for potentially confusing .*
  if (/\.\*/.test(pattern) && !/\.\*\?/.test(pattern)) {
    issues.push({ type: 'warning', message: 'Greedy .* may cause excessive backtracking — consider .*?', position: pattern.indexOf('.*') })
  }
  
  return issues
}
