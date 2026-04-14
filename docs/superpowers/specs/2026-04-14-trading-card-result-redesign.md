# Quiz Result Card — Trading Card Redesign

**Date:** 2026-04-14  
**Status:** Approved

## Overview

Redesign the quiz `ResultScreen` from a vertically-stacked centered layout to a structured trading card layout inspired by the reference infographic. The card is more visually distinct, scannable, and shareable.

---

## Layout Sections (top to bottom)

### 1. Title Banner
- **Background:** `result.color` (solid, full-width)
- **Text color:** `#0f0f0f` (dark on colored background)
- **Content:**
  - Eyebrow (small caps): "Your board game persona is…"
  - Title (h2, bold, large): `result.title`
  - Tagline (italic, small): `result.tagline` ← new field

### 2. Hero Split
- **Layout:** CSS grid `110px 1fr`, no gap
- **Left cell:** `result.game.emoji` (or `result.image` if available) — large font (56px emoji), dark background (`#0f0f0f`), centered, `min-height: 150px`, right border `1px solid #1e1e1e`
- **Right cell:** `result.traits` (6 items) as accent-colored pills, stacked vertically with `gap: 7px`, `padding: 14px`
  - Pill style: `background: result.color + '18'`, `border: 1px solid result.color + '30'`, `color: result.color`, `border-radius: 20px`, `font-size: 12px`
- **Bottom border:** `1px solid #1e1e1e`

### 3. Personality Traits
- **Layout:** `display: flex`, `align-items: flex-start`, `gap: 12px`, `padding: 14px 16px`
- **Left:** "PERSONALITY TRAITS" label — `writing-mode: vertical-rl`, `transform: rotate(180deg)`, `font-size: 9px`, `letter-spacing: 0.16em`, `text-transform: uppercase`, `color: #444`
- **Right:** `result.tags` (6–8 items) — flex-wrap, `gap: 6px`
  - Tag style: `background: #191919`, `border: 1px solid #252525`, `color: #888`, `padding: 5px 11px`, `border-radius: 20px`, `font-size: 11px`
- **Bottom border:** `1px solid #1e1e1e`

### 4. You'll Love / Hard Pass
- **Layout:** CSS grid `1fr 1fr`, left column has `border-right: 1px solid #1e1e1e`
- **Each column:** `padding: 14px 16px`
  - Header: `font-size: 10px`, `letter-spacing: 0.14em`, uppercase, `color: #555`
  - Games: `result.compatibleGames` / `result.clashGames` — `font-size: 12px`, `color: #888`, `gap: 6px`

### 5. Retake Button
- Unchanged from current implementation

---

## Animation Sequence

| Section | Timer | State var |
|---|---|---|
| Banner + Hero split | immediate | — |
| Witty traits (right of emoji) | 300ms | `traitsVisible` |
| Personality tags | 700ms | `tagsVisible` |
| Compat / Clash | 1100ms | `compatVisible` |

All transitions: `opacity 0.5s ease, transform 0.5s ease` with `translateY(8px)` start.

---

## Data Shape Changes (quizData.js — all 16 results)

### New fields
```js
tagline: 'Ten steps ahead, always',   // short punchy phrase, shown in banner
tags: [                                 // exactly 8 neutral personality descriptors
  'strategic', 'independent', 'high standards', 'direct',  // UI has no length guard — all 16 results must use exactly 8
  'relentless planner', 'skeptical of shortcuts', 'private', 'systems thinker'
],
```

### Modified fields
```js
traits: [  // expand from 4 → 6 items; witty game-context phrases
  '10 moves ahead',
  'pawn sacrifice energy',
  'reads the rulebook twice',
  'the house rules are wrong',
  'quietly winning',
  'end-game brain from turn 1',  // 2 new items
],
```

### Removed from display
- `description` — kept in data as reference but no longer rendered in the card

### Unchanged fields
- `type`, `title`, `color`, `image`, `game`, `compatibleGames`, `clashGames`

---

## Mobile Behavior

- Hero split stays as 2-col grid but left column shrinks to `90px`, emoji font-size drops to `44px`
- Trait pills font-size drops to `11px`
- Compat/clash column padding reduces to `12px 12px`
- Banner title font-size: `clamp(20px, 5vw, 26px)`

---

## Files to Change

1. **`src/components/Quiz.jsx`** — rewrite `ResultScreen` component
   - Replace current vertical layout with trading card sections
   - Update animation timers (`traitsVisible` → 300ms, new `tagsVisible` → 700ms, `compatVisible` → 1100ms)
   - Remove `gameVisible` state (game card section is gone; emoji is in hero split)

2. **`src/data/quizData.js`** — update all 16 result entries
   - Add `tagline` (string)
   - Expand `traits` to 6 items
   - Add `tags` array (6–8 items)

---

## Out of Scope

- No changes to quiz questions, scoring, or navigation
- No changes to `IntroScreen`, `QuestionScreen`, or `TransitionScreen`
- No new external assets (emoji fallback stays)
- `description` field stays in data but is not displayed
