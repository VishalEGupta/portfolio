# Quiz Transitions & Depth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add auto-advancing transition slides at 4 narrative pivots, fix early score anchoring on 4 options, and add 2 new branch questions to the game shelf and host paths.

**Architecture:** Pure data changes to `quizData.js` (new scenes, score rewrites, next pointer updates), a new `TransitionScreen` component in `Quiz.jsx` that auto-advances via `useEffect`, and test updates in `quizData.test.js`. No new files needed.

**Tech Stack:** React (Vite), Vitest, inline styles

---

## File Map

| File | Changes |
|---|---|
| `src/data/quizData.js` | Rebalance 4 option scores; add 4 transition scenes + 2 new question scenes; update `next` pointers on q3_*, q7_*, q8, q9, q2_c, q2_d |
| `src/components/Quiz.jsx` | Add `TransitionScreen` component; add `transition` render branch in main return |
| `src/data/quizData.test.js` | Add structural score tests; add transition structure tests; update INTJ path test to include q2c_ext; add 2 new path tests |

---

### Task 1: Rebalance early option scores

**Files:**
- Modify: `src/data/quizData.js`
- Test: `src/data/quizData.test.js`

- [ ] **Step 1: Write failing structural score tests**

Add at the end of `src/data/quizData.test.js` (before the closing brace):

```js
describe('score rebalancing — option weights', () => {
  test('q1 game shelf: N:2 not I:2', () => {
    expect(scenes.q1.options[2].scores).toEqual({ I: 1, N: 2, T: 1 })
  })

  test('q1 fireplace: E:1 not E:2, gains N:1', () => {
    expect(scenes.q1.options[0].scores).toEqual({ E: 1, S: 1, F: 1, N: 1 })
  })

  test('q1 host: F:2 not J:2', () => {
    expect(scenes.q1.options[3].scores).toEqual({ E: 1, S: 1, F: 2, J: 1 })
  })

  test('q2_c weird cover: E:1 not T:1', () => {
    expect(scenes.q2_c.options[0].scores).toEqual({ N: 2, P: 1, E: 1 })
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: 4 new failures in `score rebalancing — option weights`.

- [ ] **Step 3: Apply score rewrites in quizData.js**

In `src/data/quizData.js`:

**q1 option 0 (fireplace)** — find `scores: { E: 2, S: 1, F: 1 }` and replace with:
```js
scores: { E: 1, S: 1, F: 1, N: 1 },
```

**q1 option 2 (game shelf)** — find `scores: { I: 2, N: 1, T: 1 }` and replace with:
```js
scores: { I: 1, N: 2, T: 1 },
```

**q1 option 3 (host)** — find `scores: { E: 1, S: 1, F: 1, J: 2 }` and replace with:
```js
scores: { E: 1, S: 1, F: 2, J: 1 },
```

**q2_c option 0 (weird cover)** — find `scores: { N: 2, P: 1, T: 1 }` and replace with:
```js
scores: { N: 2, P: 1, E: 1 },
```

- [ ] **Step 4: Run tests — all should pass**

```bash
npm test
```

Expected: All tests pass including the 4 new score assertions and all 6 existing path simulations.

- [ ] **Step 5: Commit**

```bash
git add src/data/quizData.js src/data/quizData.test.js
git commit -m "fix: rebalance early q1/q2_c scores to reduce anchoring bias"
```

---

### Task 2: Add transition scenes and update routing

**Files:**
- Modify: `src/data/quizData.js`
- Test: `src/data/quizData.test.js`

- [ ] **Step 1: Write failing transition structure tests**

Append to `src/data/quizData.test.js`:

```js
describe('transition scene structure', () => {
  test.each(['t_game_start', 't_last_round', 't_after_final', 't_end'])(
    '%s has type, body, next, and progress',
    (key) => {
      const scene = scenes[key]
      expect(scene).toBeDefined()
      expect(scene.type).toBe('transition')
      expect(typeof scene.body).toBe('string')
      expect(scene.body.length).toBeGreaterThan(0)
      expect(typeof scene.next).toBe('string')
      expect(typeof scene.progress).toBe('number')
    }
  )

  test('q3 scenes all route through t_game_start', () => {
    for (const key of ['q3_a', 'q3_b', 'q3_c', 'q3_d']) {
      for (const option of scenes[key].options) {
        expect(option.next).toBe('t_game_start')
      }
    }
  })

  test('q7_ab and q7_cd route through t_last_round', () => {
    for (const key of ['q7_ab', 'q7_cd']) {
      for (const option of scenes[key].options) {
        expect(option.next).toBe('t_last_round')
      }
    }
  })

  test('q8 routes through t_after_final', () => {
    for (const option of scenes.q8.options) {
      expect(option.next).toBe('t_after_final')
    }
  })

  test('q9 routes through t_end', () => {
    for (const option of scenes.q9.options) {
      expect(option.next).toBe('t_end')
    }
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: 8 new failures (4 structure + 4 routing assertions).

- [ ] **Step 3: Add 4 transition scenes to quizData.js**

After the `result` scene and before the closing `}` of the `scenes` export, add:

```js
  // ─── TRANSITIONS ───────────────────────────────────────────────
  t_game_start: {
    type: 'transition',
    progress: 35,
    body: 'The games come out. Someone clears the table. The night shifts.',
    next: 'q4_dynamic',
    delay: 2500,
  },

  t_last_round: {
    type: 'transition',
    progress: 75,
    body: "It's late. Nobody's leaving. One more game — the one that matters.",
    next: 'q8',
    delay: 2500,
  },

  t_after_final: {
    type: 'transition',
    progress: 85,
    body: 'The final game ends. The table erupts — arguments, laughter, someone demanding a rematch.',
    next: 'q9',
    delay: 2500,
  },

  t_end: {
    type: 'transition',
    progress: 95,
    body: 'The house is quiet now. Just you and the drive home and whatever the night said about you.',
    next: 'result',
    delay: 3000,
  },
```

- [ ] **Step 4: Update next pointers**

In `src/data/quizData.js`, update every `next` pointer as follows:

**q3_a, q3_b, q3_c, q3_d** — all options currently have `next: 'q4_dynamic'`. Change all to `next: 't_game_start'`.  
(4 scenes × 3 options = 12 values to update)

**q7_ab** — all 3 options currently have `next: 'q8'`. Change all to `next: 't_last_round'`.

**q7_cd** — all 3 options currently have `next: 'q8'`. Change all to `next: 't_last_round'`.

**q8** — all 3 options currently have `next: 'q9'`. Change all to `next: 't_after_final'`.

**q9** — all 4 options currently have `next: 'result'`. Change all to `next: 't_end'`.

- [ ] **Step 5: Run tests — all should pass**

```bash
npm test
```

Expected: All tests pass. The existing path simulations are unaffected because `simulatePath` takes explicit scene keys and doesn't follow `next` pointers.

- [ ] **Step 6: Commit**

```bash
git add src/data/quizData.js src/data/quizData.test.js
git commit -m "feat: add transition scenes at 4 narrative pivots, update routing"
```

---

### Task 3: Add TransitionScreen component to Quiz.jsx

**Files:**
- Modify: `src/components/Quiz.jsx`

- [ ] **Step 1: Add TransitionScreen component**

In `src/components/Quiz.jsx`, add the following function after the `ImagePlaceholder` function (around line 254):

```jsx
function TransitionScreen({ scene, onAdvance }) {
  useEffect(() => {
    const timer = setTimeout(() => onAdvance(scene.next), scene.delay ?? 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ textAlign: 'center', maxWidth: 480 }}>
      <p style={{
        fontSize: '18px',
        color: '#888888',
        fontStyle: 'italic',
        lineHeight: 1.8,
        letterSpacing: '0.01em',
      }}>
        {scene.body}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Add transition render branch in Quiz return**

In `Quiz.jsx`, inside the content `<div>` (around line 179), after the `{scene.type === 'question' && ...}` block and before `{scene.type === 'result' && ...}`, add:

```jsx
        {scene.type === 'transition' && (
          <TransitionScreen
            scene={scene}
            onAdvance={(nextKey) => {
              if (nextKey === 'q4_dynamic') {
                nextKey = (totalScores.F || 0) >= (totalScores.T || 0) ? 'q4_ab' : 'q4_cd'
              }
              fadeToScene(nextKey)
            }}
          />
        )}
```

Note: `onAdvance` replicates the `q4_dynamic` routing from `handleAnswer` using `totalScores`, which is always up-to-date by the time the transition fires (the answer was committed before `fadeToScene` was called).

- [ ] **Step 3: Run dev server and smoke test transition flow**

```bash
npm run dev
```

Open `http://localhost:5173` (or wherever Vite starts). Play through the quiz to the point where a transition fires (answer q3 — the first transition `t_game_start` should appear). Verify:

- Transition text appears centered and italic
- After ~2.5s, it auto-advances to q4_ab or q4_cd (depending on your F/T score)
- Progress bar updates during the transition
- Back button on the transition returns to the previous question

- [ ] **Step 4: Commit**

```bash
git add src/components/Quiz.jsx
git commit -m "feat: add TransitionScreen component with auto-advance"
```

---

### Task 4: Add q2c_ext scene (game shelf path)

**Files:**
- Modify: `src/data/quizData.js`
- Test: `src/data/quizData.test.js`

- [ ] **Step 1: Write failing path tests**

Append to `src/data/quizData.test.js`:

```js
describe('path simulation — new branch questions', () => {
  test('game shelf extroverted path → ENFP (not locked into INTJ)', () => {
    // Demonstrates rebalancing lets E-leaning game shelf players escape I anchoring
    const result = simulatePath([
      ['q1', 2],       // I:1, N:2, T:1
      ['q2_c', 0],     // N:2, P:1, E:1
      ['q2c_ext', 0],  // E:2, F:1  — "tell me everything"
      ['q3_c', 2],     // E:1, F:1, P:1, N:1  — skim rules aloud
      ['q4_ab', 1],    // N:2, I:1
      ['q5_ab', 0],    // E:2, F:1
      ['q6_ab', 1],    // F:1, P:2
      ['q7_ab', 1],    // P:2, E:1
      ['q8', 2],       // N:2, P:1, E:1
      ['q9', 1],       // E:2, F:1, P:1
    ])
    expect(result).toBe('ENFP')
  })

  test('INTJ game shelf path → INTJ (updated to include q2c_ext)', () => {
    const result = simulatePath([
      ['q1', 2],       // I:1, N:2, T:1
      ['q2_c', 0],     // N:2, P:1, E:1
      ['q2c_ext', 2],  // I:2, N:1  — "mostly reading the box"
      ['q3_c', 0],     // S:2, J:2  → T=1, F=0 → CD track
      ['q4_cd', 2],    // N:2, I:1
      ['q5_cd', 1],    // N:2, I:1
      ['q6_cd', 1],    // I:2, N:1
      ['q7_cd', 0],    // J:2, T:1
      ['q8', 0],       // T:2, J:1, S:1
      ['q9', 0],       // J:2, I:1, T:1
    ])
    expect(result).toBe('INTJ')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: 2 new failures — both fail with `Unknown scene: q2c_ext`.

- [ ] **Step 3: Add q2c_ext scene to quizData.js**

In `src/data/quizData.js`, after the `q2_c` scene block, add:

```js
  // ─── Q2C_EXT — The Stranger (game shelf path) ─────────────────
  // Inserted between q2_c and q3_c. Probes E/I and F/T directly —
  // the game shelf path previously skipped F entirely.
  q2c_ext: {
    type: 'question',
    chapter: 'The Game Shelf',
    progress: 25,
    narrative:
      "The person next to you lights up — they've played the weird one you're holding, and they have opinions. Strong ones. They start explaining.",
    question: 'How do you respond?',
    options: [
      {
        text: "Tell me everything — you have my full attention",
        scores: { E: 2, F: 1 },
        next: 'q3_c',
      },
      {
        text: "You listen, ask a sharp question, steer toward whether it's actually good",
        scores: { T: 2, N: 1 },
        next: 'q3_c',
      },
      {
        text: "You let them talk but you're mostly reading the back of the box",
        scores: { I: 2, N: 1 },
        next: 'q3_c',
      },
    ],
  },
```

- [ ] **Step 4: Update q2_c option next pointers**

In `src/data/quizData.js`, find the `q2_c` scene. All 3 options currently have `next: 'q3_c'`. Change all to `next: 'q2c_ext'`.

- [ ] **Step 5: Update the existing INTJ test**

In `src/data/quizData.test.js`, find the existing `'INTJ game shelf path → INTJ (not ISTJ)'` test and replace it with the updated version that includes `q2c_ext` (already written in Step 1 above as `'INTJ game shelf path → INTJ (updated to include q2c_ext)'`). Delete the old test.

- [ ] **Step 6: Run tests — all should pass**

```bash
npm test
```

Expected: All tests pass including both new path simulations.

- [ ] **Step 7: Commit**

```bash
git add src/data/quizData.js src/data/quizData.test.js
git commit -m "feat: add q2c_ext scene (The Stranger) to game shelf path"
```

---

### Task 5: Add q2d_ext scene (host path)

**Files:**
- Modify: `src/data/quizData.js`
- Test: `src/data/quizData.test.js`

- [ ] **Step 1: Write failing path test**

In the `'path simulation — new branch questions'` describe block in `quizData.test.js`, add:

```js
  test('host path with q2d_ext → ISFJ', () => {
    const result = simulatePath([
      ['q1', 3],        // E:1, S:1, F:2, J:1
      ['q2_d', 0],      // S:2, T:1, J:1  — take the kitchen
      ['q2d_ext', 0],   // F:2, I:1  — warmth
      ['q3_d', 0],      // S:1, T:1, J:2  — spring into action
      ['q4_ab', 0],     // S:2, J:1
      ['q5_ab', 2],     // I:1, F:2
      ['q6_ab', 2],     // F:2, I:1
      ['q7_ab', 0],     // J:2, I:1
      ['q8', 0],        // T:2, J:1, S:1
      ['q9', 0],        // J:2, I:1, T:1
    ])
    expect(result).toBe('ISFJ')
  })
```

- [ ] **Step 2: Run tests to confirm failure**

```bash
npm test
```

Expected: 1 new failure — `Unknown scene: q2d_ext`.

- [ ] **Step 3: Add q2d_ext scene to quizData.js**

In `src/data/quizData.js`, after the `q2_d` scene block, add:

```js
  // ─── Q2D_EXT — The Moment (host path) ──────────────────────────
  // Inserted between q2_d and q3_d. Host path previously skipped
  // T/F almost entirely before the AB/CD routing decision.
  q2d_ext: {
    type: 'question',
    chapter: 'Backstage',
    progress: 25,
    narrative:
      "For one second, the chaos pauses. The host finds you, touches your arm: \"I don't know what I'd do without you.\" Something in the room softens.",
    question: 'What moves through you?',
    options: [
      {
        text: "Warmth — this is exactly why you show up for people",
        scores: { F: 2, I: 1 },
        next: 'q3_d',
      },
      {
        text: "Satisfaction — you saw the problem, you solved it, that's enough",
        scores: { T: 2, J: 1 },
        next: 'q3_d',
      },
      {
        text: "A flicker of something — you're already thinking about what still needs doing",
        scores: { N: 1, J: 2, S: 1 },
        next: 'q3_d',
      },
    ],
  },
```

- [ ] **Step 4: Update q2_d option next pointers**

In `src/data/quizData.js`, find the `q2_d` scene. All 3 options currently have `next: 'q3_d'`. Change all to `next: 'q2d_ext'`.

- [ ] **Step 5: Run tests — all should pass**

```bash
npm test
```

Expected: All tests pass including the new host path simulation.

- [ ] **Step 6: Commit**

```bash
git add src/data/quizData.js src/data/quizData.test.js
git commit -m "feat: add q2d_ext scene (The Moment) to host path"
```

---

### Task 6: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected output: All tests pass. Count should be ≥ 22 (16 original + 4 score + 8 transition + 3 new path).

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: No errors, `dist/` produced.

- [ ] **Step 3: Smoke test in dev**

```bash
npm run dev
```

Walk all 4 main paths (fireplace, kitchen, game shelf, host) to the result screen. Verify:

- Transition cards appear at the 4 pivots with italic centered text
- Each auto-advances after ~2.5–3s
- Progress bar is visible and advances during transitions
- Back button works on transition cards (returns to previous question)
- Game shelf + extroverted choices can produce non-INTJ results
- Host path now has the "The Moment" question

- [ ] **Step 4: Commit if any fixes were needed, otherwise done**
