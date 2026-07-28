# EVOLUTION.md — RegexCraft

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
