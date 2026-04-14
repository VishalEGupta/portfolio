# INFP Accessibility — Score Decoupling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove spurious I+J and I+S couplings from 4 quiz options so that players making natural INFP choices can reach an INFP result.

**Architecture:** Pure data change — 4 score object rewrites in `quizData.js`, 1 new path simulation test + stale comment updates in `quizData.test.js`. No logic, no component, no structural changes.

**Tech Stack:** Vitest (`npm test`), plain JS objects

---

## File Map

| File | Change |
|---|---|
| `src/data/quizData.js` | Rewrite 4 option score objects |
| `src/data/quizData.test.js` | Add 1 new INFP path test; update 4 stale inline score comments |

---

### Task 1: Decouple I+S and I+J scores, add INFP deep-listening path test

**Files:**
- Modify: `src/data/quizData.js`
- Test: `src/data/quizData.test.js`

- [ ] **Step 1: Write the failing INFP path test**

Append inside the existing `'path simulation — new branch questions'` describe block in `src/data/quizData.test.js`:

```js
  test('INFP kitchen via deep-listening option → INFP', () => {
    // Verifies INFP is reachable via q2_b[0] (deep listening) after decoupling J:1 from it.
    // Before the fix, q2_b[0] scored { I:1, F:2, J:1 } — the J:1 made INFP unreachable
    // on this branch even with fully P-coded choices downstream.
    const result = simulatePath([
      ['q1', 1],      // I:1, F:2          (was I:1, S:1, F:2)
      ['q2_b', 0],    // I:1, F:2          (was I:1, F:2, J:1 — J removed)
      ['q3_b', 0],    // I:1, F:2, N:1, P:1  → F≥T → AB track
      ['q4_ab', 1],   // N:2, I:1
      ['q5_ab', 2],   // I:1, F:2
      ['q6_ab', 2],   // F:2, I:1
      ['q7_ab', 2],   // F:2, P:1
      ['q8', 2],      // N:2, P:1, E:1
      ['q9', 2],      // I:1, N:2, F:1
    ])
    expect(result).toBe('INFP')
  })
```

- [ ] **Step 2: Run tests to confirm the new test fails**

```bash
npm test
```

Expected: 1 new failure — the INFP deep-listening path produces something other than INFP (likely ISFP or INFJ) because `q2_b[0]` still has `J:1` and `q1[1]` still has `S:1`.

- [ ] **Step 3: Apply the 4 score rewrites in `src/data/quizData.js`**

**q1 option 1 (kitchen)** — find `scores: { I: 1, S: 1, F: 2 }` and replace with:
```js
scores: { I: 1, F: 2 },
```

**q2_b option 0 ("Of course. Tell me everything.")** — find `scores: { I: 1, F: 2, J: 1 }` and replace with:
```js
scores: { I: 1, F: 2 },
```

**q7_ab option 0 ("Call it — you know when something is done")** — find `scores: { J: 2, I: 1 }` and replace with:
```js
scores: { J: 2 },
```

**q9 option 0 ("You're the first to call it")** — find `scores: { J: 2, I: 1, T: 1 }` and replace with:
```js
scores: { J: 2, T: 1 },
```

- [ ] **Step 4: Run tests — all should pass**

```bash
npm test
```

Expected: All tests pass including the new INFP deep-listening path. Count should be 25 (was 24 + 1 new).

Verify the 3 existing kitchen-path tests still hold:
- `INFP kitchen path → INFP` ✓
- `ISFJ kitchen path → ISFJ` ✓
- `ENFP kitchen path → ENFP` ✓

- [ ] **Step 5: Update stale inline score comments in `quizData.test.js`**

Find these 4 comment lines and update them to match the new scores:

```js
// In ENFP kitchen path test:
['q1', 1],     // I:1, F:2          ← was: I:1, S:1, F:2

// In ISFJ kitchen path test:
['q1', 1],     // I:1, F:2          ← was: I:1, S:1, F:2
['q7_ab', 0],  // J:2               ← was: J:2, I:1

// In INFP kitchen path test:
['q1', 1],     // I:1, F:2          ← was: I:1, S:1, F:2
```

Also find the `q9[0]` comment in the ISFJ test and update:
```js
['q9', 0],     // J:2, T:1          ← was: J:2, I:1, T:1
```

- [ ] **Step 6: Run tests one final time**

```bash
npm test
```

Expected: 25/25 pass.

- [ ] **Step 7: Commit**

```bash
git add src/data/quizData.js src/data/quizData.test.js
git commit -m "fix: decouple I+S and I+J scores to make INFP accessible via natural paths"
```
