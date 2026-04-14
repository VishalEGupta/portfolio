# INFP Accessibility — Score Decoupling Design Spec
**Date:** 2026-04-14
**Status:** Approved

---

## Problem

INFP (I, N, F, P) is difficult to reach because several options that feel naturally introverted or empathetic are coded with J or S scores in the same object. An INFP player making natural choices — going to the quiet kitchen, listening deeply, leaving quietly — accumulates J and S alongside I and F, and the J/S totals prevent the P/N result from landing.

Specific couplings causing the issue:

1. `q1[1]` kitchen option bundles `S:1` with `I:1` — going to a quieter social space is I+F, not I+S
2. `q2_b[0]` "of course, tell me everything" bundles `J:1` with `I:1, F:2` — deep empathetic listening is the most INFP-coded response in the quiz, and it should not score J
3. `q7_ab[0]` "call it — good at endings" bundles `I:1` with `J:2` — knowing when something is done is J behavior; it doesn't require introversion as a corollary
4. `q9[0]` "first to call it" bundles `I:1` with `J:2, T:1` — same coupling at the final question

---

## Solution

Remove the spurious cross-axis score from each affected option. No narrative changes. No structural changes.

| Scene | Option text | Current scores | New scores |
|---|---|---|---|
| `q1[1]` | "The kitchen — wine being poured, a quieter clump" | `{ I:1, S:1, F:2 }` | `{ I:1, F:2 }` |
| `q2_b[0]` | "Of course. Tell me everything." | `{ I:1, F:2, J:1 }` | `{ I:1, F:2 }` |
| `q7_ab[0]` | "Call it — you know when something is done" | `{ J:2, I:1 }` | `{ J:2 }` |
| `q9[0]` | "You're the first to call it — you're good at leaving" | `{ J:2, I:1, T:1 }` | `{ J:2, T:1 }` |

---

## Test Impact

**Existing tests verified to still pass after changes:**

- **INFP kitchen path** (`q2_b[2]` → AB track → quiet options): still INFP. Removing `S:1` from q1[1] strictly improves this path.
- **ISFJ kitchen path**: still ISFJ. J accumulates via `q4_ab[0]`, `q7_ab[0]` (still `J:2`), `q9[0]` (still `J:2`). Removing `I:1` from q7_ab[0] and q9[0] reduces I from 7 to 5, which still beats E:0. S still beats N.
- **ENFP kitchen path**: still ENFP. Only affected by q1[1] change; S drops from 1 to 0, which makes the result cleaner not worse.

**New test to add:**

`'INFP kitchen via deep-listening path → INFP'` — verifies INFP is reachable when the player picks `q2_b[0]` (the deep-listening option) rather than `q2_b[2]` (the "quieter spot" option). This is the path the fix is specifically designed to unlock.

Suggested path:
```js
['q1', 1],      // I:1, F:2          (was I:1, S:1, F:2)
['q2_b', 0],    // I:1, F:2          (was I:1, F:2, J:1 — now no J)
['q3_b', 0],    // I:1, F:2, N:1, P:1  → F≥T → AB track
['q4_ab', 1],   // N:2, I:1
['q5_ab', 2],   // I:1, F:2
['q6_ab', 2],   // F:2, I:1
['q7_ab', 2],   // F:2, P:1
['q8', 2],      // N:2, P:1, E:1
['q9', 2],      // I:1, N:2, F:1
```

Expected result: INFP

Score totals: I:7, E:1, N:7, S:0, F:13, T:0, J:0, P:3 → INFP

---

## Files Changed

| File | Change |
|---|---|
| `src/data/quizData.js` | 4 score object rewrites |
| `src/data/quizData.test.js` | 1 new path simulation test; update score comments on affected options in existing tests |

---

## Out of Scope

- No changes to narrative text
- No changes to `q3_c[0]` "explain every rule" (`S:2, J:2`) — that option is on the game shelf path where methodical rule-following is genuinely S+J behavior
- No changes to routing logic or scene structure
