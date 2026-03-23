# Pi Session Visualizer

A minimal Next.js app for visualizing Pi coding sessions.

Loads recent Pi session files directly from disk, lets you switch between them, and displays incoming and outgoing messages.

By default it opens the newest session for the current project, falling back to the newest session overall if needed. You can switch across all projects with the in-app session picker or load a specific file with `?file=/absolute/path/to/session.jsonl`.

## Implemented visualizations

- Collapsible message cards, collapsed by default
- Full JSON rendering for message `content`
- Tool result entries (read, write, edit, bash)
    - Edit diff view
    - Bash execution entries
- Session usage and cost summary
    - Assistant request count
    - Input/output/cache token breakdown
    - Cost breakdown
- Branch summary and compaction summary entries
- Custom extension entries

## File organization

The project is organized around a simple split of app shell, UI components, and reusable library code.

Keep components relatively small and split into well named files.

### `app/`

Keep App Router entry files here:

- `app/page.tsx` for top-level page data loading and composition
- `app/layout.tsx` for the global app shell
- `app/globals.css` for global styles

This directory should stay relatively thin and avoid accumulating large UI implementations or reusable parsing helpers.

### `components/`

Keep React components in `components/UpperCamelCase.tsx`.

Examples:

- `SessionNavigationPanel.tsx`
- `SessionOverview.tsx`
- `SessionEventCard.tsx`
- `SessionEventHeader.tsx`
- `SessionEventContent.tsx`

Component files should stay focused and relatively small. When a component starts handling multiple distinct rendering concerns, split those concerns into nearby component files.

### `lib/`

Keep reusable non-component code here.

Current organization:

- `session.ts` — top-level session loading API
- `sessionParser.ts` — parsing and normalization from raw session entries to rendered events
- `sessionUsage.ts` — usage/cost normalization and per-session aggregation
- `sessionEventHelpers.ts` — event display/state helper logic
- `sessionEventStyles.ts` — badge/style class helpers
- `utils.ts` — general-purpose shared utilities
- `types.ts` — shared TypeScript types

As a rule of thumb:

- reusable logic goes in `lib/`
- UI goes in `components/`
- App Router entrypoints stay in `app/`

## Styling convention

Use `cn()` from `lib/utils.ts` when combining Tailwind class names. It wraps `tailwind-merge`, so conditional and override classes merge correctly instead of conflicting silently.
