export interface MatchResult {
  full: string
  groups: (string | undefined)[]
  index: number
}

export interface SavedPattern {
  id: string
  name: string
  pattern: string
  flags: string
  createdAt: number
}

export type RegexResult =
  | { ok: true; re: RegExp; error: null }
  | { ok: false; re: null; error: string }

export interface FlagDef {
  flag: string
  name: string
  desc: string
}

export const AVAILABLE_FLAGS: FlagDef[] = [
  { flag: 'g', name: 'Global', desc: 'all matches' },
  { flag: 'i', name: 'Insensitive', desc: 'case-insensitive' },
  { flag: 'm', name: 'Multiline', desc: '^ and $ match line boundaries' },
  { flag: 's', name: 'Dotall', desc: '. matches newlines' },
  { flag: 'u', name: 'Unicode', desc: 'full Unicode support' },
  { flag: 'y', name: 'Sticky', desc: 'lastIndex sticky matching' },
  { flag: 'd', name: 'Indices', desc: 'match indices (ES2022)' },
]

export const COMMON_PATTERNS = [
  { pattern: '\\d+', desc: 'Digits (one or more)' },
  { pattern: '\\w+', desc: 'Word chars (alphanumeric + _)' },
  { pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', desc: 'Email' },
  { pattern: 'https?://[\\w./?=&-]+', desc: 'URL' },
  { pattern: '^\\d{4}-\\d{2}-\\d{2}$', desc: 'Date YYYY-MM-DD' },
  { pattern: '^(\\+\\d{1,3})?\\s?\\d{10,}$', desc: 'Phone number' },
  { pattern: '(?<=@)\\w+', desc: 'Username after @ (lookbehind)' },
  { pattern: '(?:https?://)?(?:www\\.)?[\\w-]+\\.\\w{2,}', desc: 'Domain name' },
]

export const SYNTAX_REFERENCE = [
  { token: '.', desc: 'Any char (except newline)' },
  { token: '\\d', desc: 'Digit [0-9]' },
  { token: '\\w', desc: 'Word [a-zA-Z0-9_]' },
  { token: '\\s', desc: 'Whitespace' },
  { token: '\\b', desc: 'Word boundary' },
  { token: '^', desc: 'Start of string / line (with m flag)' },
  { token: '$', desc: 'End of string / line (with m flag)' },
  { token: '*', desc: '0 or more (greedy)' },
  { token: '+', desc: '1 or more (greedy)' },
  { token: '?', desc: '0 or 1 (optional)' },
  { token: '{n,m}', desc: 'Between n and m times' },
  { token: '(x|y)', desc: 'Alternation (OR)' },
  { token: '(x)', desc: 'Capture group' },
  { token: '(?:x)', desc: 'Non-capture group' },
  { token: '(?=x)', desc: 'Lookahead' },
  { token: '(?!x)', desc: 'Negative lookahead' },
  { token: '(?<=x)', desc: 'Lookbehind' },
  { token: '(?<!x)', desc: 'Negative lookbehind' },
  { token: '\\1', desc: 'Backreference' },
  { token: '\\K', desc: 'Reset match start' },
  { token: '[abc]', desc: 'Character class' },
  { token: '[^abc]', desc: 'Negated char class' },
]
