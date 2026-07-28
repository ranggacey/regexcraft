export interface MatchResult {
  full: string
  groups: (string | undefined)[]
  index: number
  indices?: [number, number][]
}

export interface TestCase {
  id: string
  name: string
  testStr: string
  expectedMatches?: string[]
  createdAt: number
}

export interface SavedPattern {
  id: string
  name: string
  pattern: string
  flags: string
  testCases: TestCase[]
  createdAt: number
  updatedAt: number
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
  { category: 'Text', pattern: '\\d+', desc: 'Digits (one or more)' },
  { category: 'Text', pattern: '\\w+', desc: 'Word chars (alphanumeric + _)' },
  { category: 'Text', pattern: '[a-zA-Z]+', desc: 'Letters only' },
  { category: 'Text', pattern: '[^\\s]+', desc: 'Non-whitespace sequence' },
  { category: 'Text', pattern: '[\\u00C0-\\u017F]+', desc: 'Accented Latin letters' },

  { category: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', desc: 'Standard email' },
  { category: 'Email', pattern: '^([^@\\s]+)@((?:[\\w-]+\\.)+[\\w]{2,})$', desc: 'Email with domain validation' },

  { category: 'URL', pattern: 'https?://[\\w./?=&-]+', desc: 'HTTP/URL' },
  { category: 'URL', pattern: '^(https?://)?(www\\.)?[\\w-]+\\.\\w{2,}(/\\S*)?$', desc: 'URL with optional protocol' },
  { category: 'URL', pattern: '(?:https?://)?(?:www\\.)?[\\w-]+\\.\\w{2,}', desc: 'Domain name' },

  { category: 'Date/Time', pattern: '^\\d{4}-\\d{2}-\\d{2}$', desc: 'ISO date YYYY-MM-DD' },
  { category: 'Date/Time', pattern: '^\\d{2}/\\d{2}/\\d{4}$', desc: 'US date MM/DD/YYYY' },
  { category: 'Date/Time', pattern: '^\\d{2}:\\d{2}(:\\d{2})?$', desc: 'Time HH:MM or HH:MM:SS' },
  { category: 'Date/Time', pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}', desc: 'ISO datetime' },

  { category: 'Phone', pattern: '^(\\+\\d{1,3})?\\s?\\d{10,}$', desc: 'Phone with optional country code' },
  { category: 'Phone', pattern: '^\\(\\d{3}\\)\\s?\\d{3}-\\d{4}$', desc: 'US phone (XXX) XXX-XXXX' },

  { category: 'IP', pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d?\\d)$', desc: 'IPv4 address' },
  { category: 'IP', pattern: '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$', desc: 'IPv6 full' },

  { category: 'Code', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', desc: 'Hex color' },
  { category: 'Code', pattern: '^[A-Fa-f0-9]{32}$', desc: 'MD5 hash' },
  { category: 'Code', pattern: '^[A-Fa-f0-9]{40}$', desc: 'SHA-1 hash' },
  { category: 'Code', pattern: '^[A-Fa-f0-9]{64}$', desc: 'SHA-256 hash' },
  { category: 'Code', pattern: '^[A-Za-z0-9+/]{40,}={0,2}$', desc: 'Base64 string' },
  { category: 'Code', pattern: '^\\d{1,3}(,\\d{3})*(\\.\\d+)?$', desc: 'Number with commas' },

  { category: 'Validation', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$', desc: 'Strong password (8+, upper, lower, digit)' },
  { category: 'Validation', pattern: '^\\w+([.-]?\\w+)*@\\w+([.-]?\\w+)*(\\.\\w{2,3})+$', desc: 'Email strict' },
  { category: 'Validation', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', desc: 'IPv4 strict' },
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
