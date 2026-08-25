<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Design system

This app follows a design standard shared across a small suite of apps (Planner Turni, Housekeeping, Transfer). Before building any new UI, reuse what's here rather than introducing new colors, radii, fonts, or one-off components — that's what keeps the suite visually consistent as it grows.

## Tokens (`src/app/globals.css`)

- The palette, radii, and shadows are defined once, in a Tailwind v4 `@theme` block, by **overriding Tailwind's own color scale** (`--color-slate-*`, `--color-purple-*`, `--color-amber-*`, `--color-blue-*`, `--color-emerald-*`, `--color-green-*`, `--color-red-*`). This means ordinary Tailwind utility classes (`bg-purple-600`, `text-slate-500`, `border-slate-200`, `rounded-lg`, `shadow-sm`, …) already carry the right design-system values — **use them normally, don't reach for arbitrary hex values or a different color family** (no `violet`, `indigo`, `zinc`, `gray`, etc.).
- Fonts: **Manrope** for headings (applied globally to `h1`–`h4`, no class needed), **Public Sans** for body/UI (the default), **JetBrains Mono** for tabular/numeric data (prices, times, IDs) via `font-mono`.
- Status color vocabulary — six semantic buckets, never use `purple`/accent for status (accent is reserved for primary actions/brand):
  | Meaning | Tailwind family | Used for |
  |---|---|---|
  | In attesa (wait) | `amber` | pending/awaiting states |
  | In corso (prog) | `blue` | in-progress/assigned states |
  | Confermato (ok) | `emerald` | confirmed states |
  | Completato (done) | `green` (deeper than emerald, kept distinct — "confirmed" and "completed" are different lifecycle moments) | completed states |
  | Annullato / avviso (bad) | `red` | cancelled/rejected states |
  | Inattivo / riposo (off) | `slate` | inactive/at-rest states (rarely used here) |
- A second layer of plain CSS custom properties (`--bg`, `--surface`, `--ink`, `--accent`, `--wait-bg`, `--prog-ink`, `--r-md`, `--f-head`, …) aliases the same tokens under the **exact variable names used in the shared cross-app design doc**. Use these directly in inline styles or custom CSS when a Tailwind utility doesn't fit — markup copied from that doc, or from Housekeeping/Planner Turni, should work here with the same variable names. There is no dark-mode variant of these tokens yet.

## Reusable components (`src/components/ui/`, plus a few shared components elsewhere)

Check this list before writing a new form control or UI pattern — most needs are already covered:

- `button.tsx` — `Button`/`LinkButton`, variants `primary`/`secondary`/`outline`/`ghost`/`danger`, sizes `sm`/`md`. Has the doc's hover-lift/active-press micro-interaction built in.
- `badge.tsx` — `Badge` (generic pill) and `StatusBadge` (transfer status, colored per the vocabulary above).
- `field.tsx` — `Label`, `Input`, `Textarea`, `FieldError`, `FieldGroup`, and re-exports `Select` from `select.tsx`.
- `select.tsx` — `Select`: a custom dropdown (trigger + listbox), **not** a native `<select>`. Takes `<option>` children exactly like a native select for drop-in compatibility (value/defaultValue/onChange/name/required/disabled all work the same); keeps a hidden native `<select>` internally so plain `<form>` submission and `FormData` still work unchanged.
- `date-field.tsx` — `DateField`: a calendar-popover date picker (Italian month names, Monday-start week) replacing native `<input type="date">`. Same drop-in API (`value`/`onChange` or `name`/`defaultValue` for plain forms).
- `radio.tsx` — `Radio`: circular indicator + label, wraps a real (visually hidden) `<input type="radio">` for accessibility.
- `checkbox.tsx` — `Checkbox`: rounded-square indicator + animated check, same real-hidden-input pattern.
- `toggle.tsx` — `Toggle`: sliding on/off switch for boolean state that also acts as the action control (see `driver-row.tsx`/`route-row.tsx` — one switch replaces a separate status label + toggle button).
- `stat-card.tsx` — `StatCard`: label + big mono number, colored top border, optional link.
- `empty-state.tsx` — `EmptyState`: icon + title (+ optional description) for "nothing here" placeholders instead of a plain text line.
- `card.tsx` — `Card`/`CardHeader`/`CardBody`.
- `circle-flag.tsx` (in `src/components/`, not `ui/`) — `CircleFlag`: crops a `country-flag-icons` flag into a true circle (don't rely on `object-cover` on the raw flag SVG — it isn't reliable cross-browser; always go through `CircleFlag`).
- `dashboard-shell.tsx` — the floating purple pill navbar used by every operator dashboard (hotel/taxi/admin). Reuse this shell (pass `nav` items) rather than building a new header.

Native `<input type="time">` is intentionally still used (styled with `font-mono`) — a fully custom time picker was judged materially riskier to get right than the date grid was. Revisit only if asked.

There is no toast/notification-banner, confirm/alert-dialog, or pagination component in this app yet (nothing to unify because nothing exists) — if a future task needs one, design it against the tokens above rather than a generic library default.
