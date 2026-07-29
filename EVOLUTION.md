# EVOLUTION.md — RegexCraft

## v0.10.0 — Capture Groups Viewer

### New features
- **Match Groups Viewer**: Table display of capture groups for active match. Shows group number, name (for named groups), value, and index positions. Helps understand complex regexes with many capture groups. Uses indices flag data when available.

### Code quality
- New `MatchGroupsViewer` component in `components/MatchGroupsViewer.tsx`.
- Integrated into main App after MatchDetails panel.
- Supports both numbered groups and named groups (future-ready).

### Performance
- Build: 236 KB JS (main), 157 KB JS (visualizer), 21 KB CSS.

## v0.9.0 — Match Navigation + Active Highlight

### New features
- **Match Navigation**: Arrow buttons to cycle through multiple matches. Shows current/total count (e.g., "2/5").
- **Active Match Highlight**: Selected match highlighted in cyan with ring effect, other matches remain yellow. Helps focus on specific match when many exist.

### Code quality
- Added `matchIndex` state in App.tsx, passed to ResultsDisplay.
- `buildHighlighted()` now accepts `activeIndex` param to apply different styling.

### Performance
- Build: 234 KB JS (main), 157 KB JS (visualizer), 21 KB CSS.

## v0.8.0 — Regex Syntax Linter

### New features
- **Regex Syntax Linter**: Real-time static analysis catches common regex mistakes before runtime. Detects:
  - Empty character classes `[]`
  - Unclosed character classes `[`
  - Unclosed/unmatched groups `(`, `)`
  - Invalid quantifiers at start or after alternation
  - Unknown escape sequences
  - Duplicate flags in `(?...)` groups
  - Greedy `.*` (suggests `.*?` for better performance)
  - Dangling quantifiers after alternation groups
- Issues displayed as warnings (amber) or errors (red) below pattern input

### Code quality
- New `lib/regexLinter.ts` with `LintIssue` type and `lintRegex()` function.
- Integrated into `PatternInput` component via `useMemo` for efficient re-linting.

### Performance
- Build: 233 KB JS (main), 157 KB JS (visualizer), 20 KB CSS.

## v0.7.0 — Test Case Management + Expanded Pattern Library

### New features
- **Test Cases per Saved Pattern**: Save multiple named test strings with each pattern. Select a pattern, add test cases, click to copy test string to main input. Enables regression testing patterns against multiple inputs.
- **Expanded Common Patterns Library**: Categorized patterns (Text, Email, URL, Date/Time, Phone, IP, Code, Validation) with 30+ ready-to-use regexes. Grouped by category in cheat sheet modal.
- **Test Cases Sidebar Panel**: New collapsible panel in right sidebar showing saved patterns dropdown + test case list with add/edit/delete.

### Code quality
- Added `TestCase` and extended `SavedPattern` types with `testCases[]` and `updatedAt` fields.
- Migration logic in `getSavedPatterns()` handles legacy localStorage data.
- New utility functions: `addTestCase()`, `deleteTestCase()`, `updateSavedPattern()`.

### Performance
- Build: 226 KB JS (main), 157 KB JS (visualizer chunk), 19 KB CSS.
- Test case state stays in localStorage, no bundle impact.

## v0.6.0 — Regex Visualizer + Enhanced Explainer + Indices Flag Support

### New features
- **Regex Visualizer (Railroad Diagram)**: Lazy-loaded sidebar panel showing interactive regex railroad diagram via `@regexper/render`. Splits into separate chunk (157 KB) to keep main bundle lean.
- **Enhanced Regex Explainer**: Comprehensive token parser now handles escape sequences (`\xNN`, `\uNNNN`, `\u{NNNNNN}`), character classes `[...]`, quantifiers `{n,m}`, group constructs (`(?:)`, `(?=)`, `(?!), `(?<=)`, `(?<!)`, `(?>)`, `(?#)`, `(?<name>)`, `(?P<name>)`), backreferences, Unicode properties (`\p{}`, `\P{}`), and control characters.
- **'d' flag (Indices) support**: When `d` flag is enabled, match details show start/end indices for full match and each capture group. Updates `MatchResult` type with optional `indices` field.

### Performance
- Lazy-load RegexVisualizer via `React.lazy` + `Suspense` — main bundle stays ~220 KB, visualizer in separate 157 KB chunk.
- Build: 220 KB JS (main), 157 KB JS (visualizer chunk), 19 KB CSS.

## v0.5.0 — Regex Benchmark Mode

### New features
- **Regex Benchmark Mode**: Empirical performance testing panel in sidebar. Runs regex replace N times (configurable 100–100k iterations), shows total time, per-iteration nanoseconds, ops/sec throughput. Includes warmup runs for JIT fairness. Helps detect slow patterns in practice, complementing static catastrophic-backtracking warning.

### Performance
- Build: 215 KB JS, 19 KB CSS.

## v0.4.0 — Keyboard Shortcuts + Performance Warnings + Export/Import + UX Polish

### New features
- **Keyboard shortcuts**: ⌘K / Ctrl+K focuses pattern input, ⌘L / Ctrl+L focuses test string, Escape closes cheat sheet.
- **Export/Import saved patterns**: Download/upload JSON files for your saved patterns library.
- **Copy individual match**: Each match detail row has a copy button to grab match text.
- **Clear test string**: One-click button to wipe test input.

### Performance
- **Catastrophic backtracking detector**: Warns on nested quantifiers like `(a+)+`, `(a*)*`, etc. that risk regex DoS.

### UI/UX
- Keyboard shortcut hints in footer.
- id attributes on pattern/test inputs for focus targeting.

### Code quality
- `detectCatastrophicPattern()` in `lib/utils.ts` for regex safety analysis.
- `exportSavedPatterns()`, `importSavedPatterns()` for persistence portability.
- Build: 212 KB JS, 19 KB CSS.

## v0.3.0 — Permalink Sharing + SEO + Polish

### New features
- **Permalink/Share**: State (pattern, flags, test string) encoded in URL hash. Share button copies full URL. State syncs to hash on every change.
- **Load from hash**: Opening a shared link restores exact pattern, flags, and test string.

### SEO
- OG meta tags (title, description, type, URL)
- Twitter card tags
- Meta description

### UI/UX
- Share button in header nav (🔗 Share)
- Transitions on hover states, button feedback
- Copy link confirmation (✓ link copied)

### Performance
- Build: 205 KB JS (stable), 17 KB CSS (stable)
- Hash sync via `history.replaceState` (no page reload)
- Base64-urlsafe encoding for compact URLs

## v0.2.0 — Refactor + Cheat Sheet + Replace Mode + Explainer

### Breaking changes
- None. Full backward compatibility.

### New features
- **Replace mode**: Toggle button in header. Enter replacement string (supports $1 backreferences). Shows real-time substitution result.
- **Regex Cheat Sheet**: Modal with common patterns (click to insert) + full syntax reference table.
- **Regex Explainer**: Auto-generated plain-English breakdown of pattern tokens. Shows in right sidebar.
- **Stats panel**: Pattern length, test string size, line count, match count.

### UI/UX
- Responsive grid layout: 2-column on large screens (main input + sidebar), stacked on mobile.
- Sidebar with quick reference mini-table + link to full cheat sheet.
- Replace mode toggle in header with green active state.
- Replace string input appears below test area when replace mode on.
- Footer consolidated: tech stack + "zero regex libs" note.

### Code quality
- Split monolithic App.tsx into components:
  - `PatternInput.tsx` — pattern + flags + copy
  - `TestStringInput.tsx` — test text + replace input
  - `ResultsDisplay.tsx` — match highlighting / replace output
  - `MatchDetails.tsx` — capture group details
  - `RegexExplainer.tsx` — pattern explanation
  - `CheatSheet.tsx` — common patterns + syntax reference modal
- Extracted types to `types.ts`, utility functions to `lib/utils.ts`.
- All components use explicit prop types.

### Accessibility
- `role="alert"` on regex error.
- `title` attributes on flag buttons and action buttons.
- Improved keyboard navigation with native button elements.

### Performance
- Build size: 204 KB JS (up 9 KB due to new features), 17 KB CSS (up 5 KB from Tailwind utilities).
- All new components use `useMemo`/`useCallback` for stable references.

## v0.1.0 — Initial Release

- Interactive regex tester with live matching & highlighting
- Flag toggle buttons (g, i, m, s, u, y)
- Match details panel showing capture groups
- Copy regex to clipboard
- Dark theme with Tailwind v4
