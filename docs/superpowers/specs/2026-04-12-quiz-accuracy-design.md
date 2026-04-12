# Quiz Accuracy Improvement — Design Spec
**Date:** 2026-04-12
**Status:** Approved

---

## Problem

Users report inaccurate quiz results. Root causes identified through code analysis and simulated path tracing:

1. **Tiebreaker bias** — `computeMBTI` uses `>=`, so any tied dimension defaults to E, S, T, or J regardless of what the user actually answered. With compound scoring spreading points across 2–3 dimensions per question, ties are frequent — especially on T/F and J/P.

2. **J/P under-coverage** — Questions 1–3 (the branching tree) rarely score J or P. Nearly all J/P signal sits in the two shared questions (Q4, Q5).

3. **S/N conflation with F** — Empathetic narrative framing causes F-leaning choices to accidentally score N. ISFx users get misclassified as INFx.

4. **E/I under-coverage on social paths** — The kitchen path (B) accumulates I:4+ by Q3 with no offsetting E signal, causing ENFPs and ESFJs to read as introverted types.

**Confirmed failures via simulated path tracing:**

| User type | Old result | Cause |
|-----------|------------|-------|
| ENFP (fireplace → debate) | ENTP | T/F tied at 2–2, defaults to T |
| ENFP (kitchen → all warm answers) | INFP | I:4, E:1 by Q3, never corrected |
| INTJ (game shelf → structured) | ISTJ | S/N tied at 3–3, defaults to S |
| ISFJ (kitchen → empathy) | INFJ | N=3, S=1 from narrative framing accident |

---

## Goals

- Fix all four confirmed misclassification cases
- Increase quiz from 5 to 9 questions per path
- Keep the board game night narrative cohesive
- Keep the scoring system simple (no weight changes to existing questions)

---

## Non-Goals

- Not changing score weights on existing questions (Q1–Q5 / Q8–Q9)
- Not adding imagery or assets
- Not changing the result screen UI
- Not achieving clinical MBTI accuracy (this is a portfolio personality quiz)

---

## Solution

### 1. Tiebreaker Fix

Replace the static `>=` tiebreaker in `computeMBTI` with a **trajectory tiebreaker**:

```js
// Current (biased):
const pick = (a, b) => ((scores[a] || 0) >= (scores[b] || 0) ? a : b)

// New (trajectory-aware):
const pick = (a, b, history) => {
  const sa = scores[a] || 0
  const sb = scores[b] || 0
  if (sa !== sb) return sa > sb ? a : b
  // True tie: count how many questions scored each dimension
  const countA = history.filter(s => (s[a] || 0) > 0).length
  const countB = history.filter(s => (s[b] || 0) > 0).length
  if (countA !== countB) return countA > countB ? a : b
  // Still tied: fall back to defaults (E, S, T, J)
  return a
}
```

`scoreHistory` (already in Quiz.jsx state) is passed into `computeMBTI` and used for trajectory. This fixes the ENFP→ENTP case: T=2 vs F=2 tied, but F appeared in more questions → F wins.

### 2. Scene Graph — 9 Questions Per Path

**Old structure (5 questions/path):**
```
intro → q1 → q2_{a,b,c,d} → q3_{a,b,c,d} → q4(shared) → q5(shared) → result
```

**New structure (9 questions/path):**
```
intro → q1 → q2_{a,b,c,d} → q3_{a,b,c,d}
                                  ↓ (score-based routing)
                            q4_{ab} | q4_{cd}
                                  ↓
                            q5_{ab} | q5_{cd}
                                  ↓
                            q6_{ab} | q6_{cd}
                                  ↓
                            q7_{ab} | q7_{cd}
                                  ↓
                            q8 (was q4, shared)
                                  ↓
                            q9 (was q5, shared)
                                  ↓
                                result
```

**8 new scenes** total (4 new questions × 2 group variants each). Old q4/q5 renamed to q8/q9 — content unchanged.

### 3. Score-Based Routing (not path-based)

After q3, the route to q4 is determined by accumulated T vs F scores — not by which narrative branch was taken:

```
F >= T  →  q4_ab  (warm/people-first track)
T > F   →  q4_cd  (analytical/task-first track)
```

This is implemented in `Quiz.jsx` by computing `totalScores` at the q3 transition and passing the appropriate next scene key.

**Why score-based:** Someone who took the kitchen path (B) but answered analytically throughout (e.g., "help them think it through" in q3_b, scoring T:2) should get CD-track questions. Path-based routing would misplace them.

### 4. New Question Targeting

Each new scene targets the dimension most underserved for that group after Q1–Q3.

**Group AB (F ≥ T — warm/people-first):**

| Scene | Target | Rationale |
|-------|--------|-----------|
| `q4_ab` | **S/N** | F-path framing accidentally scores N. Need a direct concrete-vs-abstract probe. |
| `q5_ab` | **E/I** | Kitchen path accumulates I:4+ with no E offset. Discriminates ENFP from INFP. |
| `q6_ab` | **T/F** | Reinforces or corrects T/F after one more behavioral data point. |
| `q7_ab` | **J/P** | Least-covered axis on AB paths before the shared questions. |

**Group CD (T > F — analytical/task-first):**

| Scene | Target | Rationale |
|-------|--------|-----------|
| `q4_cd` | **T/F** | Both CD paths score T heavily, rarely probe values. Need a logic-vs-principles moment. |
| `q5_cd` | **S/N** | Path C is NTP-heavy, path D is STJ-heavy. After merging, S/N needs confirmation. |
| `q6_cd` | **E/I** | Path C scores I:2 upfront; path D scores E:1. Needs a direct probe to separate them. |
| `q7_cd` | **J/P** | Path D has J:2 head-start; path C can land anywhere. Needs discriminator before final shared questions. |

### 5. Progress Bar

Evenly distributed across 9 questions:

| Scene | Progress |
|-------|----------|
| intro | 0% |
| q1 | 10% |
| q2 | 21% |
| q3 | 34% |
| q4 | 45% |
| q5 | 56% |
| q6 | 67% |
| q7 | 78% |
| q8 | 89% |
| result | 100% |

---

## Testing Plan

Simulate the following paths and assert the correct MBTI result:

| Test | Path | Expected |
|------|------|----------|
| ENFP fireplace | q1-A → q2_a-B → q3_a-B → [AB track] → q8-B → q9-B | ENFP |
| ENFP kitchen | q1-B → q2_b-C → q3_b-A → [AB track] → q8-B → q9-B | ENFP |
| INTJ game shelf | q1-C → q2_c-A → q3_c-B → [CD track] → q8-A → q9-A | INTJ |
| ISFJ kitchen | q1-B → q2_b-A → q3_b-A → [AB track] → q8-A → q9-A | ISFJ |
| ENTJ fireplace | q1-A → q2_a-A → q3_a-A → [AB or CD] → q8-A → q9-A | ENTJ |
| INFP kitchen | q1-B → q2_b-C → q3_b-A → [AB track] → q8-C → q9-C | INFP |

---

## Files Changed

| File | Change |
|------|--------|
| `src/data/quizData.js` | Add 8 new scenes (q4_ab, q5_ab, q6_ab, q7_ab, q4_cd, q5_cd, q6_cd, q7_cd); rename q4→q8, q5→q9; update progress values; update `computeMBTI` signature |
| `src/components/Quiz.jsx` | Pass `scoreHistory` to `computeMBTI`; implement score-based routing after q3; update progress bar values |

---

## Open Questions

None. All design decisions confirmed.
