# Design — Z-Running

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

Produced by `hallmark redesign` on 2026-09-10.

## Genre

**editorial** — Sport belongs to the editorial theme cluster.

Editorial bans that bind this app:

- No glassmorphism. The medium is paper, not glass.
- No pure `#000` / `#fff` as paper or ink.
- No card-in-card.
- No three-column equal icon-tile feature grid.
- No centred-everything hero.
- Pill buttons are fine; **gradient fill on a pill is not**.

## Theme — Sport (roman)

Sport is historically an italic-uppercase athletic theme. **This system uses the
roman rework**: italic headers are a global ban (slop-test gate 38a), so the
athletic voice is carried by *width and weight*, never by slant.

Three diversification axes:

| Axis | Value |
| --- | --- |
| Paper band | light (light mode) / dark (dark mode) |
| Display style | display-condensed, roman |
| Accent hue | cool (blue, 258°) — **deliberate deviation, see below** |

### Deviation 1 — the accent is cool, not Sport's red

Sport's catalog accent is red. This app cannot use it. `danger` is already red
and the app's central job is telling a runner when conditions are *unsafe*
(不適合跑, 空品差, 高熱風險). A brand colour identical to the danger signal is a
functional collision, not a taste preference. Orange is equally unavailable —
it collides with `warn`.

So the accent stays cool and instead becomes an actual decision: a tuned OKLCH
electric blue at hue 258, with every neutral tinted toward it. Sport's identity
is carried where it belongs — **condensed black display type, oversized tabular
numerals, high paper/ink contrast, hard hairline rules**. A stadium timing board
is dark with bright numerals, not red.

**Do not "restore" a red or orange accent in a later pass.** It reintroduces the
collision.

### Deviation 2 — CJK headings carry Sport through weight, not width

Big Shoulders Display has no CJK coverage. Chinese headings fall through, per
glyph, to the system CJK cascade — which is not condensed. This is unavoidable,
so it is codified as a rule rather than left as a bug:

- **Latin text and all numerals** carry the condensed Sport voice.
- **CJK headings** carry it through weight (700–900) and tightened tracking.

No CJK webfont is loaded. This app is opened on mobile data before a run; a CJK
webfont costs 100–300 KB even subsetted, against a fully-declared system cascade
that costs zero. The explicit cascade is what fixes per-device drift.

*Upgrade path:* if cross-platform identity matters more than payload later, add
`IBM Plex Sans TC` (same superfamily as the body face) to the Google Fonts link
and prepend it to `--font-cjk`. Nothing else changes.

## Macrostructure family

| Family | Routes | Macrostructure | Why |
| --- | --- | --- | --- |
| **Readout** | `/weather` · `/badminton` | **04 Stat-Led** | One giant number is the page — the running score, the match score. Everything else supports or qualifies it. |
| **Workbench** | `/running` · `/weight` · `/pitching` · `/ui` | **05 Workbench** | The tool in use *is* the content. Input → transform → readout, no marketing scaffolding. |

Pages within a family share the family's shape. They vary only in component
archetypes. There are no marketing or content pages in this project yet; when one
arrives, use **02 Long Document** and amend this table.

## Navigation and footer

- **Nav: N3 Side-rail.** Collapsible desktop rail, hamburger sheet below 48 rem.
  Already the app's shape — preserved, not reinvented.
- **Footer: Ft2 Inline single line.** One centred hairline-topped line.

Both are locked. An app has one nav; rotating it per page would be slop.

## Theme tokens

Hue anchor is **255–258**. Every neutral carries 0.003–0.022 chroma toward it —
zero-chroma grey is banned. No `#fff`, no `#000`.

### Light

```
--app-bg        oklch(96.5% 0.007 255)
--surface       oklch(99.2% 0.003 255)
--surface-2     oklch(97.6% 0.005 255)
--surface-3     oklch(94.2% 0.009 255)
--border        oklch(89%   0.011 255)
--border-strong oklch(81%   0.013 255)
--text          oklch(21%   0.022 255)
--text-muted    oklch(44%   0.018 255)
--text-subtle   oklch(57%   0.015 255)
--primary       oklch(52%   0.216 258)
--primary-hover oklch(45%   0.200 258)
--primary-soft  oklch(94%   0.035 258)
--primary-ink   oklch(99%   0.004 255)
--focus         oklch(48%   0.220 258)
```

### Dark

Same hue. Only lightness and chroma move. Elevation is *lighter*, never darker.

```
--app-bg        oklch(15%   0.014 255)
--surface       oklch(19.5% 0.016 255)
--surface-2     oklch(16.8% 0.015 255)
--surface-3     oklch(24%   0.018 255)
--border        oklch(31%   0.017 255)
--border-strong oklch(40%   0.017 255)
--text          oklch(95%   0.006 255)
--text-muted    oklch(77%   0.013 255)
--text-subtle   oklch(63%   0.015 255)
--primary       oklch(70%   0.170 258)
--primary-hover oklch(78%   0.150 258)
--primary-soft  oklch(30%   0.080 258)
--primary-ink   oklch(16%   0.020 258)
--focus         oklch(72%   0.170 258)
```

### Semantic scale

`success` · `warn` · `danger` · `info` · `accent` (violet, for data series only).

Every semantic colour ships three tokens: the colour, a `-soft` surface, and an
**`-ink`** — the text colour to use when that colour fills a surface.

**`background: var(--warn)` must be paired with `color: var(--warn-ink)`.**
Hardcoding `text-white` on a fill is a bug: `--warn` is light enough that white
text fails contrast on it. This is why `-ink` exists for every fill colour.

Colour is never the only signal. Every semantic state pairs with an icon or text.

## Typography

- **Display:** `Big Shoulders Display`, weight 700–900, roman. Headings, section
  titles, and every oversized numeral.
- **Body:** `IBM Plex Sans`, weight 400 / 600. UI, prose, labels.
- **CJK cascade:** `PingFang TC` → `Microsoft JhengHei` → `Noto Sans TC` →
  `Heiti TC`. The tail of both stacks.

**Two families, no mono.** Tabular alignment comes from
`font-variant-numeric: tabular-nums`, not from a third face. A mono outlier would
have to appear in a dozen readout slots across this app, and an outlier used in
more than two slots is a third body font — which is slop.

### Scale

Tailwind's default step ladder is retained — the pages are written against it and
re-basing it would force a full relayout for no design gain. The system adds
only what it needs and enforces the floors:

- `--text-2xs` = 0.625rem (10 px) — **absolute floor**, micro-labels only.
- `text-xs` (12 px) is the floor for any repeated UI label.
- `text-base` (16 px) is the floor for body copy.
- `--text-display` = `clamp(2.25rem, 4vw + 1rem, 3.75rem)` — section display heads.
- `--text-readout` = `clamp(3rem, 11vw, 6.5rem)` — the one giant number per
  Readout page. Permitted above the 5.5 rem display cap because it is a
  single token of ≤ 4 characters.

**Arbitrary `text-[Npx]` values are banned.** Use the ladder.

### Rules

- All-caps display heads: `line-height` ≥ 1.0 (gate 55). Condensed faces collide
  below that when a title wraps.
- Display tracking: `-0.02em` Latin, `-0.01em` CJK.
- Label tracking: `0.08em` with `uppercase`, on micro-labels only.
- `tabular-nums` on every numeric readout.
- Never italic on any heading, wordmark, or stat figure.

## Spacing

9-step 4 pt named scale, exposed to Tailwind as `--spacing-*`.

```
3xs 2px · 2xs 4px · xs 8px · sm 12px · md 16px
lg 24px · xl 40px · 2xl 64px · 3xl 96px
```

Pages use named tokens. Raw pixel values are a bug.

## Radius

Tighter than the previous 12–16 px default — athletic, not soft.

```
--radius-sm 4px · --radius-md 8px · --radius-lg 12px · --radius-pill 999px
```

## Motion

Sport's duration scale is **0.7×** with a sharp `--ease-out`. Quick, decisive,
no spring.

```
--dur-micro  90ms   button press, colour shift
--dur-short 150ms   hover, tooltip, menu
--dur-long  300ms   modal, drawer, sheet

--ease-out    cubic-bezier(0.16, 1, 0.3, 1)     entering
--ease-in     cubic-bezier(0.7, 0, 0.84, 0)     leaving
--ease-in-out cubic-bezier(0.65, 0, 0.35, 1)    toggles
```

- **Animate `transform` and `opacity` only.** Never `width`, `height`, or any
  layout property. The sidebar collapse is the known offender — it transitions
  `width` and must not.
- `transition-all` is banned. Name the properties.
- The browser default `ease` is banned.
- **Reduced motion is global**, not per-component: one
  `@media (prefers-reduced-motion: reduce)` block collapses spatial motion to
  ≤ 150 ms opacity. Functional motion (skeletons, spinners) keeps running.

## Focus

Non-negotiable, and the single largest defect in the pre-redesign app.

```css
:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
  border-radius: inherit;
}
```

- `--focus` is its own token, never reused as a fill colour.
- 2 px offset means the ring lands on the page, so it stays visible even on an
  accent-filled button.
- **Never transitioned, never animated.** It appears instantly or it is useless.
- `focus:outline-none` without a replacement is a defect, not a style.

## Z-index

Six named levels. Ad-hoc values and responsive z-index are bugs.

```
--z-base 1 · --z-raised 10 · --z-dropdown 100
--z-sticky 200 · --z-modal 400 · --z-toast 500
```

## Microinteractions stance

- **Silent success.** A visible result needs no toast. Toasts are for failures
  and for actions that hide their own effect.
- Hover tooltips delay 800 ms; focus tooltips delay 0 ms.
- Hit targets ≥ 44 × 44 px on touch. Never below.
- Every hover affordance has a focus equivalent. No hover-only functionality.
- Hover effects live inside `@media (hover: hover)` so touch devices don't get
  stuck states.
- **At most three animation primitives across the app.** Currently: press-tick ·
  hover-raise · skeleton-pulse. Adding a fourth requires removing one.
- Async state updates announce via `aria-live="polite"`.

## Component contract

Every interactive component ships all eight states: default · hover ·
`:focus-visible` · active · disabled · loading · error · success.

Input-specific:

- **Border width is constant across every state.** State changes go to
  `background-color`, `outline`, or `box-shadow` — never `border-width`.
  Layout shift on focus is a tell.
- Input height == button height. One base height, 44 px floor on touch.
- Label above the field. Placeholder shows format, not instruction.
- Error replaces helper text in the same slot, with `aria-invalid` and a glyph.
  Never colour alone.

Modals use native `<dialog>` + `showModal()` — focus trap, Esc, backdrop and
scroll lock come free and are not worth hand-rolling.

## CTA voice

- **Primary:** `--primary` fill, `--primary-ink` text, `--radius-md`, semibold,
  press-tick on `:active`. One per view.
- **Secondary:** `--surface` fill, hairline `--border`, deepens to
  `--border-strong` on hover.
- **Ghost:** no fill until hover, then `--surface-3`.
- Copy is a verb: 計算配速 · 套用 · 定位. Never 提交 / 確定 alone.
- Labels never wrap to two lines (gate 49). Shorten the label before wrapping it.

## Per-page allowances

- **Readout pages** may use one oversized `--text-readout` numeral. One per page.
- **Workbench pages** must not use enrichment — the tool carries the page.
- No page may use hero imagery, illustration, or decorative background.
- No page invents metrics. Every number rendered comes from a real reading or a
  real calculation.

## What pages MUST share

- The wordmark and the side-rail.
- The accent hue and its placement (≤ 5 % of any viewport).
- Display + body font stacks.
- CTA voice — button shape, radius, padding rhythm.
- Focus ring treatment.
- The semantic colour meanings: green safe · amber caution · red unsafe.

## What pages MAY differ on

- Macrostructure within their family.
- Which components appear and in what density.
- Section rhythm and padding — sections need not be evenly padded.

## Mobile floor

Verified at **320 / 375 / 414 / 768 px**. Non-negotiable:

- No horizontal scroll; `overflow-x: clip` on `html` and `body` — never `hidden`
  (`hidden` creates a scroll container and breaks `position: sticky`).
- `dvh`, never `vh`. `100vh` on iOS counts the retracting toolbar.
- No clickable text wrapping to two lines.
- Image-bearing grid tracks use `minmax(0, 1fr)`, never bare `1fr`.
- Hit targets ≥ 44 px.
- `viewport-fit=cover` plus `env(safe-area-inset-*)` padding.

## Exports

Drop-in formats for re-using this system. The live tokens are in
`client/src/index.css`; `tokens.css` at the project root is the portable copy.

### tokens.css

See [`tokens.css`](tokens.css) at the project root — full light + dark token set.

### Tailwind v4 `@theme`

This project *is* the Tailwind v4 consumer. The mapping lives in
`client/src/index.css`: semantic colours are declared as plain custom properties
on `:root` / `.dark` so they can be rebound at runtime, then exposed as utilities
through `@theme` (`bg-primary`, `text-ink-muted`, `border-border`, `ease-out`,
`rounded-md`). Do not put the raw values inside `@theme` directly — that breaks
runtime dark-mode rebinding.

### DTCG `tokens.json`

Not emitted. Add it if a second consumer appears; a single-app project doesn't
need the indirection.

### shadcn/ui CSS variables

Not emitted — this project has its own component library in
`client/src/components/ui/` and does not consume shadcn.
