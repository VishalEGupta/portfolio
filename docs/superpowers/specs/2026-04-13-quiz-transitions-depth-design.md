# Quiz Transitions & Depth — Design Spec
**Date:** 2026-04-13  
**Status:** Approved

---

## Problem

Two related issues with the current quiz:

1. **Score anchoring**: Q1 options stack 2 points on a single axis before any other signal exists. Players who choose the game shelf immediately accumulate `I:2`, making it hard to route to an extroverted result even with consistently extroverted answers later. Similar anchoring exists on the fireplace and host paths.

2. **Abrupt narrative transitions**: The story jumps between question scenes without any atmospheric breathing room. The most jarring is q3 → q4, where all four divergent paths suddenly converge into gameplay with no narrative bridge.

---

## Solution Overview

Three coordinated changes:

1. **`transition` scene type** — auto-advancing narrative cards at 4 key story pivots
2. **Score rebalancing** — reduce early heavy-axis anchoring on q1 and q2_c
3. **Two new branch questions** — `q2_c` and `q2_d` paths get an extra question each, probing under-covered axes before the AB/CD routing decision

---

## 1. Transition Scene Type

### Data shape (`quizData.js`)

```js
{
  type: 'transition',
  progress: 35,          // same field as questions — drives the progress bar
  body: 'Some atmospheric text.',
  next: 'q4_ab',        // scene to advance to after delay
  delay: 2500,          // ms before auto-advance; default 2500 if omitted
}
```

### Component (`Quiz.jsx`)

New `TransitionScreen` component:
- Renders `scene.body` as a centered paragraph in italic, `#888888`, `max-width: 480px`
- A `useEffect` calls `fadeToScene(scene.next)` after `scene.delay ?? 2500`
- Cleans up the timeout on unmount (e.g. if the user hits Back before it fires)
- No click/tap required — fully automatic

The `handleBack` logic requires no changes — `path` already tracks all visited scenes including transitions, so pressing Back from a transition correctly returns to the previous question.

### Placement — 4 pivots

| ID | Inserted between | Body |
|---|---|---|
| `t_game_start` | `q3_*` → `q4_dynamic` | *"The games come out. Someone clears the table. The night shifts."* |
| `t_last_round` | `q7_ab` / `q7_cd` → `q8` | *"It's late. Nobody's leaving. One more game — the one that matters."* |
| `t_after_final` | `q8` → `q9` | *"The final game ends. The table erupts — arguments, laughter, someone demanding a rematch."* |
| `t_end` | `q9` → `result` | *"The house is quiet now. Just you and the drive home and whatever the night said about you."* |

**Not added** between q1 → q2: q2 opens with its own scene-setting narrative paragraph, making a transition redundant there.

**Implementation note**: `q3_a`, `q3_b`, `q3_c`, `q3_d` all currently point `next: 'q4_dynamic'`. Change them all to point to `t_game_start`, which then points to `q4_dynamic`. Similarly, `q7_ab` and `q7_cd` both point to `q8` — change to `t_last_round`. `q8` points to `q9` — change to `t_after_final`. `q9` options all point to `result` — change to `t_end`.

---

## 2. Score Rebalancing

### Changes

| Scene | Option | Current scores | New scores | Reason |
|---|---|---|---|---|
| `q1` | Game shelf | `I:2, N:1, T:1` | `I:1, N:2, T:1` | Curiosity is N-dominant. Shift weight to N so E/I stays open. |
| `q1` | Fireplace | `E:2, S:1, F:1` | `E:1, S:1, F:1, N:1` | Reduce E anchoring; joining an in-progress story has perceptive (N) quality. |
| `q1` | Host | `E:1, S:1, F:1, J:2` | `E:1, S:1, F:2, J:1` | J:2 too heavy this early; redistribute to F which is the stronger signal. |
| `q2_c` | Weird/cryptic cover | `N:2, P:1, T:1` | `N:2, P:1, E:1` | Remove T assumption — curiosity-driven game browsing is N/E as much as T. Helps extroverted players recover on this path. |

### Test path impact

Existing test paths in `quizData.test.js` must be re-verified after rebalancing. Any test that passes through `q1` option 2 (game shelf) or `q2_c` option 0 (weird cover) will have different accumulated scores and may need updated expectations or re-confirmation that the result is still correct.

---

## 3. New Branch Questions

### Q2.5_C — "The Stranger" (game shelf path)

**Inserted between**: `q2_c` → `q3_c` (change `q2_c` options' `next` from `q3_c` to `q2c_ext`, which points to `q3_c`)

**Scene key**: `q2c_ext`  
**Chapter**: The Game Shelf  
**Progress**: 25  
**Narrative**: *"The person next to you lights up — they've played the weird one you're holding, and they have opinions. Strong ones. They start explaining."*  
**Question**: How do you respond?

| Option | Text | Scores |
|---|---|---|
| A | "Tell me everything — you have my full attention" | `E:2, F:1` |
| B | "You listen, ask a sharp question, steer toward whether it's actually good" | `T:2, N:1` |
| C | "You let them talk but you're mostly reading the back of the box" | `I:2, N:1` |

**Purpose**: Probes E/I and F/T directly in the game shelf context. The current q2_c never touches F, and probes T only once. This gives E-leaning players a path to recover from the q1 `I:1` start before q3_c routes them.

---

### Q2.5_D — "The Moment" (host path)

**Inserted between**: `q2_d` → `q3_d` (change `q2_d` options' `next` from `q3_d` to `q2d_ext`, which points to `q3_d`)

**Scene key**: `q2d_ext`  
**Chapter**: Backstage  
**Progress**: 25  
**Narrative**: *"For one second, the chaos pauses. The host finds you, touches your arm: \"I don't know what I'd do without you.\" Something in the room softens."*  
**Question**: What moves through you?

| Option | Text | Scores |
|---|---|---|
| A | "Warmth — this is exactly why you show up for people" | `F:2, I:1` |
| B | "Satisfaction — you saw the problem, you solved it, that's enough" | `T:2, J:1` |
| C | "A flicker of something — you're already thinking about what still needs doing" | `N:1, J:2, S:1` |

**Purpose**: Host path currently skips T/F almost entirely before the AB/CD routing decision. This moment naturally surfaces values (F) vs. competence satisfaction (T) vs. forward-planning (J/N) — all under-measured on this branch.

---

## Scene Graph After Changes

```
intro → q1 (4 opts)
  → q2_a → q3_a ──────────────────┐
  → q2_b → q3_b ──────────────────┤
  → q2_c → q2c_ext → q3_c ────────┤→ t_game_start → q4_dynamic
  → q2_d → q2d_ext → q3_d ────────┘
                                        ↓
                            F≥T: q4_ab → q5_ab → q6_ab → q7_ab ──┐
                            T>F: q4_cd → q5_cd → q6_cd → q7_cd ──┘
                                        ↓
                                   t_last_round → q8
                                        ↓
                                   t_after_final → q9
                                        ↓
                                    t_end → result
```

---

## Files Changed

| File | Change |
|---|---|
| `src/data/quizData.js` | Add 4 transition scenes, 2 new question scenes, rebalance 4 option score objects, update `next` pointers |
| `src/components/Quiz.jsx` | Add `TransitionScreen` component, add `transition` branch to the scene type render switch |
| `src/data/quizData.test.js` | Update/add path simulation tests for affected paths; add test coverage for transition scene traversal |

---

## Out of Scope

- Visual assets for transitions (no images, no special styling beyond italic body text)
- Changes to the result screen or MBTI computation logic
- Adding transitions to the intro or between q1 and q2
