# Quiz Accuracy Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix MBTI misclassifications by adding a trajectory-aware tiebreaker, expanding to 9 questions per path, and adding 8 new branching scenes that target under-measured personality dimensions.

**Architecture:** Two files change — `src/data/quizData.js` gets new scenes, renamed scenes, updated progress values, and an improved `computeMBTI`; `src/components/Quiz.jsx` gets score-based routing after q3 and passes `scoreHistory` to `computeMBTI`. A Vitest suite validates all confirmed misclassification paths.

**Tech Stack:** React 19, Vite 8, Vitest (new — no existing test framework)

---

## File Map

| File | Change |
|------|--------|
| `package.json` | Add `vitest` devDep, add `"test"` script |
| `vite.config.js` | Add `test: { environment: 'node' }` block |
| `src/data/quizData.test.js` | New — unit + path simulation tests |
| `src/data/quizData.js` | Fix `computeMBTI`; rename q4→q8, q5→q9; add 8 new scenes; update progress values |
| `src/components/Quiz.jsx` | Score-based routing after q3; pass `scoreHistory` to `computeMBTI` |

---

## Task 1: Install Vitest and scaffold test file

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`
- Create: `src/data/quizData.test.js`

- [ ] **Step 1: Install Vitest**

```bash
npm install --save-dev vitest
```

Expected: `vitest` appears in `package.json` devDependencies.

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add `"test": "vitest run"` to the `scripts` section:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "auth:spotify": "node scripts/auth-spotify.js"
  }
}
```

- [ ] **Step 3: Add test config to vite.config.js**

Replace `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/portfolio/',
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 4: Create empty test file**

Create `src/data/quizData.test.js`:

```js
import { describe, test, expect } from 'vitest'
import { computeMBTI, scenes } from './quizData.js'
```

- [ ] **Step 5: Confirm Vitest runs**

```bash
npm test
```

Expected output: `No test files found` or `0 tests passed` — confirms Vitest is installed and wired up.

---

## Task 2: Write failing tests for computeMBTI

**Files:**
- Modify: `src/data/quizData.test.js`

- [ ] **Step 1: Replace test file contents with unit tests**

```js
import { describe, test, expect } from 'vitest'
import { computeMBTI, scenes } from './quizData.js'

// ─── computeMBTI unit tests ────────────────────────────────────────────────

describe('computeMBTI — no ties', () => {
  test('clear winner on all axes returns correct type', () => {
    const scores = { E: 5, I: 1, N: 4, S: 1, F: 6, T: 0, P: 3, J: 0 }
    const history = [
      { E: 2, S: 1, F: 1 },
      { N: 2, F: 1, I: 1 },
      { F: 2, J: 1, N: 1 },
      { F: 1, P: 2, E: 1 },
      { E: 2, F: 1, P: 1 },
    ]
    expect(computeMBTI(scores, history)).toBe('ENFP')
  })
})

describe('computeMBTI — trajectory tiebreaker', () => {
  test('ENFP fireplace→debate: T/F tie resolves to F via trajectory', () => {
    // T=2, F=2 but F appeared in 2 questions, T only in 1
    const scores = { E: 8, S: 2, T: 2, F: 2, N: 3, P: 3, J: 0, I: 0 }
    const history = [
      { E: 2, S: 1, F: 1 },  // Q1: F scored
      { E: 2, S: 1, P: 1 },  // Q2: neither T nor F
      { E: 1, T: 2, N: 1 },  // Q3: T scored
      { N: 2, P: 1, E: 1 },  // Q4: neither
      { E: 2, F: 1, P: 1 },  // Q5: F scored
    ]
    expect(computeMBTI(scores, history)).toBe('ENFP')
  })

  test('INTJ game shelf: S/N tie resolves to N via trajectory', () => {
    // S=3, N=3 but N appeared in 2 questions, S only in 1
    const scores = { I: 4, E: 0, N: 3, S: 3, T: 5, F: 0, J: 5, P: 1 }
    const history = [
      { I: 2, N: 1, T: 1 },  // Q1: N scored
      { N: 2, P: 1, T: 1 },  // Q2: N scored
      { S: 2, J: 2 },         // Q3: S scored
      { T: 2, J: 1, S: 1 },  // Q4: S scored again
      { J: 2, I: 1, T: 1 },  // Q5: neither
    ]
    expect(computeMBTI(scores, history)).toBe('INTJ')
  })

  test('all-zero scores fall back to ESTJ default', () => {
    expect(computeMBTI({}, [])).toBe('ESTJ')
  })
})
```

- [ ] **Step 2: Run tests and confirm they FAIL**

```bash
npm test
```

Expected: All 3 tests fail — `computeMBTI` currently only accepts one argument and uses `>=` tiebreaker, so the trajectory tests return wrong types. This proves the tests are real.

---

## Task 3: Fix computeMBTI with trajectory tiebreaker

**Files:**
- Modify: `src/data/quizData.js` — `computeMBTI` function only

- [ ] **Step 1: Replace computeMBTI**

Find this in `src/data/quizData.js`:

```js
export function computeMBTI(scores) {
  const pick = (a, b) => ((scores[a] || 0) >= (scores[b] || 0) ? a : b)
  return pick('E', 'I') + pick('S', 'N') + pick('T', 'F') + pick('J', 'P')
}
```

Replace with:

```js
export function computeMBTI(scores, history = []) {
  const pick = (a, b) => {
    const sa = scores[a] || 0
    const sb = scores[b] || 0
    if (sa !== sb) return sa > sb ? a : b
    // True tie: winner is whichever dimension appeared in more questions
    const countA = history.filter(s => (s[a] || 0) > 0).length
    const countB = history.filter(s => (s[b] || 0) > 0).length
    if (countA !== countB) return countA > countB ? a : b
    // Still tied: fall back to statistically common pole (E, S, T, J)
    return a
  }
  return pick('E', 'I') + pick('S', 'N') + pick('T', 'F') + pick('J', 'P')
}
```

- [ ] **Step 2: Run tests and confirm they pass**

```bash
npm test
```

Expected:

```
✓ computeMBTI — no ties > clear winner on all axes returns correct type
✓ computeMBTI — trajectory tiebreaker > ENFP fireplace→debate: T/F tie resolves to F via trajectory
✓ computeMBTI — trajectory tiebreaker > INTJ game shelf: S/N tie resolves to N via trajectory
✓ computeMBTI — trajectory tiebreaker > all-zero scores fall back to ESTJ default
4 passed
```

- [ ] **Step 3: Commit**

```bash
git add src/data/quizData.js src/data/quizData.test.js package.json vite.config.js
git commit -m "feat: trajectory-aware tiebreaker in computeMBTI + Vitest setup"
```

---

## Task 4: Rename q4→q8, q5→q9 and update progress values

**Files:**
- Modify: `src/data/quizData.js`

All 12 changes are in `quizData.js`. Make them in order to avoid stale references.

- [ ] **Step 1: Rename the q5 scene key and update its progress**

Find:
```js
  q5: {
    type: 'question',
    chapter: 'The End of the Night',
    progress: 86,
```

Replace with:
```js
  q9: {
    type: 'question',
    chapter: 'The End of the Night',
    progress: 90,
```

- [ ] **Step 2: Rename the q4 scene key, update its progress, and fix its options' next**

Find:
```js
  q4: {
    type: 'question',
    chapter: 'The Final Game',
    progress: 68,
```

Replace with:
```js
  q8: {
    type: 'question',
    chapter: 'The Final Game',
    progress: 80,
```

Then within that same q8 scene, all four options have `next: 'q5'`. Replace all four with `next: 'q9'`. There are exactly 3 options (not 4 — check the file) — each has `next: 'q5'`:

```js
        next: 'q9',
```

(Replace all 3 occurrences of `next: 'q5'` inside the q8 scene.)

- [ ] **Step 3: Update q3 options to route through dynamic sentinel**

All four q3 scenes (`q3_a`, `q3_b`, `q3_c`, `q3_d`) have options with `next: 'q4'`. There are 3 options per scene × 4 scenes = 12 occurrences. Replace all of them:

Find (in quizData.js, inside q3 scenes only):
```js
        next: 'q4',
```

Replace all 12 with:
```js
        next: 'q4_dynamic',
```

- [ ] **Step 4: Update progress values on q1, q2, and q3 scenes**

The new distribution is: q1=10, q2=20, q3=30 (was q1=10, q2=28, q3=46).

Find all occurrences of `progress: 28` (4 scenes: q2_a, q2_b, q2_c, q2_d) and replace with `progress: 20`.

Find all occurrences of `progress: 46` (4 scenes: q3_a, q3_b, q3_c, q3_d) and replace with `progress: 30`.

- [ ] **Step 5: Verify build still compiles**

```bash
npm run build
```

Expected: Build succeeds. (The `q4_dynamic` sentinel is just a string — Quiz.jsx doesn't read it yet, so no runtime error at build time.)

- [ ] **Step 6: Commit**

```bash
git add src/data/quizData.js
git commit -m "refactor: rename q4→q8, q5→q9, add q4_dynamic routing sentinel, rebalance progress"
```

---

## Task 5: Write failing path simulation tests

**Files:**
- Modify: `src/data/quizData.test.js`

- [ ] **Step 1: Add simulatePath helper and path tests**

Append to the bottom of `src/data/quizData.test.js`:

```js
// ─── Path simulation ───────────────────────────────────────────────────────
//
// simulatePath takes an ordered array of [sceneKey, optionIndex] pairs and
// walks the scene graph, accumulating scores exactly as Quiz.jsx does.
// Handles the 'q4_dynamic' routing sentinel the same way Quiz.jsx will.

function simulatePath(steps) {
  let scoreHistory = []

  for (const [sceneKey, optionIndex] of steps) {
    const scene = scenes[sceneKey]
    if (!scene) throw new Error(`Unknown scene: ${sceneKey}`)
    const option = scene.options[optionIndex]
    if (!option) throw new Error(`No option ${optionIndex} in scene ${sceneKey}`)
    scoreHistory = [...scoreHistory, option.scores || {}]
  }

  const totalScores = scoreHistory.reduce((acc, s) => {
    for (const k in s) acc[k] = (acc[k] || 0) + s[k]
    return acc
  }, {})

  return computeMBTI(totalScores, scoreHistory)
}

// Route helper — mirrors the Quiz.jsx dynamic routing logic
function routeAfterQ3(scoreHistory) {
  const s = scoreHistory.reduce((acc, entry) => {
    for (const k in entry) acc[k] = (acc[k] || 0) + entry[k]
    return acc
  }, {})
  return (s.F || 0) >= (s.T || 0) ? 'q4_ab' : 'q4_cd'
}

describe('path simulation — confirmed misclassification fixes', () => {
  test('ENFP fireplace path → ENFP (not ENTP)', () => {
    // q1-A fireplace → q2_a-B "what were you feeling?" → q3_a-B mediate
    // → CD track (T=2 from debate) → q4_cd-B root for underdog → q5_cd-B pattern
    // → q6_cd-A replay out loud → q7_cd-C unexpected move → q8-B for the bit → q9-B stay till last
    const result = simulatePath([
      ['q1', 0],     // E:2, S:1, F:1
      ['q2_a', 1],   // N:2, F:1, I:1
      ['q3_a', 1],   // F:2, J:1, N:1  → F=4, T=0 → AB track
      ['q4_ab', 1],  // N:2, I:1
      ['q5_ab', 0],  // E:2, F:1
      ['q6_ab', 1],  // F:1, P:2
      ['q7_ab', 1],  // P:2, E:1
      ['q8', 1],     // F:1, P:2, E:1
      ['q9', 1],     // E:2, F:1, P:1
    ])
    expect(result).toBe('ENFP')
  })

  test('ENFP kitchen path → ENFP (not INFP)', () => {
    // q1-B kitchen → q2_b-C quieter spot → q3_b-A just listen
    // → AB track → q4_ab-B pattern → q5_ab-A back into group (E signal)
    // → q6_ab-B let it go → q7_ab-B say yes → q8-B for the bit → q9-B stay till last
    const result = simulatePath([
      ['q1', 1],     // I:1, S:1, F:2
      ['q2_b', 2],   // I:2, F:1, N:1
      ['q3_b', 0],   // I:1, F:2, N:1, P:1  → F=5, T=0 → AB track
      ['q4_ab', 1],  // N:2, I:1
      ['q5_ab', 0],  // E:2, F:1  ← counteracts I accumulation
      ['q6_ab', 1],  // F:1, P:2
      ['q7_ab', 1],  // P:2, E:1
      ['q8', 1],     // F:1, P:2, E:1
      ['q9', 1],     // E:2, F:1, P:1
    ])
    expect(result).toBe('ENFP')
  })

  test('INTJ game shelf path → INTJ (not ISTJ)', () => {
    // q1-C game shelf → q2_c-A cryptic game → q3_c-A explain rules
    // → CD track (T=2, F=0) → q4_cd-C watch strategy → q5_cd-B pattern
    // → q6_cd-B already preparing → q7_cd-A execute → q8-A to win → q9-A first to leave
    const result = simulatePath([
      ['q1', 2],     // I:2, N:1, T:1
      ['q2_c', 0],   // N:2, P:1, T:1
      ['q3_c', 0],   // S:2, J:2  → T=2, F=0 → CD track
      ['q4_cd', 2],  // N:2, I:1
      ['q5_cd', 1],  // N:2, I:1
      ['q6_cd', 1],  // I:2, N:1
      ['q7_cd', 0],  // J:2, T:1
      ['q8', 0],     // T:2, J:1, S:1
      ['q9', 0],     // J:2, I:1, T:1
    ])
    expect(result).toBe('INTJ')
  })

  test('ISFJ kitchen path → ISFJ (not INFJ)', () => {
    // q1-B kitchen → q2_b-A "tell me everything" → q3_b-A just listen
    // → AB track → q4_ab-A exact state (S signal) → q5_ab-C one person
    // → q6_ab-C quietly honest → q7_ab-A call it → q8-A to win → q9-A first to leave
    const result = simulatePath([
      ['q1', 1],     // I:1, S:1, F:2
      ['q2_b', 0],   // I:1, F:2, J:1
      ['q3_b', 0],   // I:1, F:2, N:1, P:1  → F=6, T=0 → AB track
      ['q4_ab', 0],  // S:2, J:1  ← concrete/S signal
      ['q5_ab', 2],  // I:1, F:2
      ['q6_ab', 2],  // F:2, I:1
      ['q7_ab', 0],  // J:2, I:1
      ['q8', 0],     // T:2, J:1, S:1
      ['q9', 0],     // J:2, I:1, T:1
    ])
    expect(result).toBe('ISFJ')
  })

  test('INFP kitchen path → INFP', () => {
    // Regression: existing INFP path should not be broken by new questions
    const result = simulatePath([
      ['q1', 1],     // I:1, S:1, F:2
      ['q2_b', 2],   // I:2, F:1, N:1
      ['q3_b', 0],   // I:1, F:2, N:1, P:1  → AB track
      ['q4_ab', 1],  // N:2, I:1
      ['q5_ab', 2],  // I:1, F:2  ← introverted choice
      ['q6_ab', 2],  // F:2, I:1
      ['q7_ab', 2],  // F:2, P:1
      ['q8', 2],     // N:2, P:1, E:1
      ['q9', 2],     // I:1, N:2, F:1
    ])
    expect(result).toBe('INFP')
  })

  test('ENTJ path → ENTJ (regression)', () => {
    const result = simulatePath([
      ['q1', 0],     // E:2, S:1, F:1
      ['q2_a', 0],   // E:2, S:1, P:1
      ['q3_a', 0],   // E:1, T:2, N:1  → T=2, F=1 → CD track
      ['q4_cd', 0],  // T:2, E:1
      ['q5_cd', 0],  // S:2, T:1
      ['q6_cd', 0],  // E:2, T:1
      ['q7_cd', 0],  // J:2, T:1
      ['q8', 0],     // T:2, J:1, S:1
      ['q9', 0],     // J:2, I:1, T:1
    ])
    expect(result).toBe('ENTJ')
  })
})
```

- [ ] **Step 2: Run tests and confirm path tests FAIL**

```bash
npm test
```

Expected: The 4 original unit tests still pass. The 6 new path tests fail with errors like `Unknown scene: q4_ab` — because the new scenes don't exist yet.

---

## Task 6: Add 8 new scenes to quizData.js

**Files:**
- Modify: `src/data/quizData.js`

Add the following block inside the `scenes` object, after the `q3_d` scene and before the `q8` (formerly q4) scene.

- [ ] **Step 1: Add the AB track scenes (q4_ab through q7_ab)**

Insert after the `q3_d` closing brace and before the `q8` scene:

```js
  // ─── Q4_AB — The First Move (AB track: F ≥ T) ─────────────────
  // Target: S/N — F-path framing accidentally scores N; need a direct
  // concrete-vs-abstract probe to separate ISFx from INFx users.
  q4_ab: {
    type: 'question',
    chapter: 'The First Move',
    progress: 40,
    narrative:
      "The game is underway. Pieces placed, first moves made. It's almost your turn. You find yourself already in your head.",
    question: 'What are you actually thinking about?',
    options: [
      {
        text: 'The exact state of the board — what\'s been played, what\'s left, what you know for certain',
        scores: { S: 2, J: 1 },
        next: 'q5_ab',
      },
      {
        text: 'The shape of it — how this could unfold, what patterns you\'re already reading',
        scores: { N: 2, I: 1 },
        next: 'q5_ab',
      },
      {
        text: 'The other players — you\'re watching people more than the board',
        scores: { F: 2, E: 1 },
        next: 'q5_ab',
      },
    ],
  },

  // ─── Q5_AB — The Break (AB track) ─────────────────────────────
  // Target: E/I — kitchen path accumulates I:4+ by Q3 with no E signal.
  // This discriminates ENFP from INFP, ESFJ from ISFJ.
  q5_ab: {
    type: 'question',
    chapter: 'The Break',
    progress: 50,
    narrative:
      "Someone calls a pause — drinks need refilling, a timer needs resetting. The game stops for a moment. The room breathes.",
    question: 'Where do you go?',
    options: [
      {
        text: 'Back into the group — you want to be in the middle of whatever conversation starts up',
        scores: { E: 2, F: 1 },
        next: 'q6_ab',
      },
      {
        text: 'You stay put, running the last few rounds through your head',
        scores: { I: 2, N: 1 },
        next: 'q6_ab',
      },
      {
        text: 'You find one person and have an actual conversation — not the whole room, just one',
        scores: { I: 1, F: 2 },
        next: 'q6_ab',
      },
    ],
  },

  // ─── Q6_AB — The Call (AB track) ──────────────────────────────
  // Target: T/F — even F-dominant paths can tie on T/F if one
  // analytical answer slipped in. This reinforces or corrects.
  q6_ab: {
    type: 'question',
    chapter: 'The Call',
    progress: 60,
    narrative:
      "Something ambiguous happens — a move that might be bending the rules. It changes the outcome. No one's sure if it was legal. Eyes go to you.",
    question: 'What matters most to you right now?',
    options: [
      {
        text: 'Getting it right — you look up the rule, you play it straight, fair is fair',
        scores: { T: 2, J: 1 },
        next: 'q7_ab',
      },
      {
        text: 'Keeping the energy — it\'s close enough, let it go, not worth the friction',
        scores: { F: 1, P: 2 },
        next: 'q7_ab',
      },
      {
        text: 'Being honest — you say something quietly to the person, give them the chance to call it themselves',
        scores: { F: 2, I: 1 },
        next: 'q7_ab',
      },
    ],
  },

  // ─── Q7_AB — Last Round (AB track) ────────────────────────────
  // Target: J/P — least-covered axis on AB paths before the shared questions.
  q7_ab: {
    type: 'question',
    chapter: 'Last Round',
    progress: 70,
    narrative:
      "The game wraps up. Someone immediately suggests one more. It's late, but there's still something in the air.",
    question: 'What do you do?',
    options: [
      {
        text: 'Call it — you know when something is done, and you\'re good at endings',
        scores: { J: 2, I: 1 },
        next: 'q8',
      },
      {
        text: 'Say yes without thinking — you don\'t want this to be over',
        scores: { P: 2, E: 1 },
        next: 'q8',
      },
      {
        text: 'Read the room first — you\'ll match whatever the group actually needs',
        scores: { F: 2, P: 1 },
        next: 'q8',
      },
    ],
  },

  // ─── Q4_CD — The Opponent (CD track: T > F) ───────────────────
  // Target: T/F — both CD paths score T heavily but rarely probe F.
  // Need a logic-vs-values moment to separate T from F on this track.
  q4_cd: {
    type: 'question',
    chapter: 'The Opponent',
    progress: 40,
    narrative:
      "One player at the table has locked in — clearly the strongest, methodically one move ahead of everyone else. They're playing to win. For real.",
    question: 'How do you respond?',
    options: [
      {
        text: 'You lock in too. This is exactly what you came for — a real game',
        scores: { T: 2, E: 1 },
        next: 'q5_cd',
      },
      {
        text: 'You start rooting for the underdog — someone should push back against them',
        scores: { F: 2, E: 1 },
        next: 'q5_cd',
      },
      {
        text: 'You find yourself more interested in watching their strategy than beating them',
        scores: { N: 2, I: 1 },
        next: 'q5_cd',
      },
    ],
  },

  // ─── Q5_CD — The Pivot (CD track) ─────────────────────────────
  // Target: S/N — path C is NTP-heavy, path D is STJ-heavy.
  // After merging at q4_cd, this confirms or corrects the S/N call.
  q5_cd: {
    type: 'question',
    chapter: 'The Pivot',
    progress: 50,
    narrative:
      "You have to make a move. You've been tracking this game carefully. The moment is here.",
    question: 'What do you trust?',
    options: [
      {
        text: 'The data — what\'s actually happened, what you know for certain is still in play',
        scores: { S: 2, T: 1 },
        next: 'q6_cd',
      },
      {
        text: 'The pattern — you\'ve been reading how the table plays, and you trust that read',
        scores: { N: 2, I: 1 },
        next: 'q6_cd',
      },
      {
        text: 'Your instinct — something about this specific moment is telling you',
        scores: { N: 1, P: 2 },
        next: 'q6_cd',
      },
    ],
  },

  // ─── Q6_CD — Between Rounds (CD track) ────────────────────────
  // Target: E/I — path C scores I:2 upfront; path D scores E:1.
  // After 5+ questions together, need a direct E/I probe to separate them.
  q6_cd: {
    type: 'question',
    chapter: 'Between Rounds',
    progress: 60,
    narrative:
      "The first game ends. People stretch, argue about what just happened. The room gets loud.",
    question: 'Where are you in this?',
    options: [
      {
        text: 'In it — you\'re replaying the key moments out loud with anyone who\'ll engage',
        scores: { E: 2, T: 1 },
        next: 'q7_cd',
      },
      {
        text: 'Elsewhere — you\'re already mentally preparing for the next game',
        scores: { I: 2, N: 1 },
        next: 'q7_cd',
      },
      {
        text: 'Watching — you\'re curious how other people experienced it differently',
        scores: { I: 1, F: 2 },
        next: 'q7_cd',
      },
    ],
  },

  // ─── Q7_CD — The Endgame (CD track) ───────────────────────────
  // Target: J/P — path D starts with J:2 head start; path C can land
  // anywhere. Need a direct discriminator before shared final questions.
  q7_cd: {
    type: 'question',
    chapter: 'The Endgame',
    progress: 70,
    narrative:
      "Three moves from now, this game is decided. You can see it clearly. You know exactly what you need to do.",
    question: 'What do you actually do?',
    options: [
      {
        text: 'Execute — you mapped it out, you follow through without second-guessing',
        scores: { J: 2, T: 1 },
        next: 'q8',
      },
      {
        text: 'Adapt — something shifted and the better play is different from your plan',
        scores: { P: 2, N: 1 },
        next: 'q8',
      },
      {
        text: 'Go for the unexpected move — risky, probably brilliant, definitely memorable',
        scores: { N: 2, P: 1 },
        next: 'q8',
      },
    ],
  },
```

- [ ] **Step 2: Run tests — path tests should now have scene resolution but may still fail on MBTI results**

```bash
npm test
```

Expected: The `Unknown scene: q4_ab` errors are gone. All path tests now pass — `simulatePath` walks the scene graph directly and does not depend on Quiz.jsx routing.

---

## Task 7: Update Quiz.jsx — dynamic routing and pass scoreHistory to computeMBTI

**Files:**
- Modify: `src/components/Quiz.jsx`

Two targeted changes only.

- [ ] **Step 1: Add score-based routing to handleAnswer**

Find `handleAnswer` in `Quiz.jsx`:

```js
  const handleAnswer = (option, index) => {
    setSelectedOption(index)
    setScoreHistory((h) => [...h, option.scores || {}])
    setTimeout(() => fadeToScene(option.next), 350)
  }
```

Replace with:

```js
  const handleAnswer = (option, index) => {
    setSelectedOption(index)
    setScoreHistory((h) => [...h, option.scores || {}])

    let nextKey = option.next
    if (nextKey === 'q4_dynamic') {
      // Compute routing using current scoreHistory + this answer's scores.
      // Can't use the pending state update — read scoreHistory directly here.
      const updatedHistory = [...scoreHistory, option.scores || {}]
      const updated = updatedHistory.reduce((acc, s) => {
        for (const k in s) acc[k] = (acc[k] || 0) + s[k]
        return acc
      }, {})
      nextKey = (updated.F || 0) >= (updated.T || 0) ? 'q4_ab' : 'q4_cd'
    }

    setTimeout(() => fadeToScene(nextKey), 350)
  }
```

- [ ] **Step 2: Pass scoreHistory to computeMBTI in the result screen**

Find this in the JSX (inside the `scene.type === 'result'` block):

```js
          <ResultScreen
            result={results[computeMBTI(totalScores)]}
```

Replace with:

```js
          <ResultScreen
            result={results[computeMBTI(totalScores, scoreHistory)]}
```

- [ ] **Step 3: Run all tests and confirm everything passes**

```bash
npm test
```

Expected:

```
✓ computeMBTI — no ties > clear winner on all axes returns correct type
✓ computeMBTI — trajectory tiebreaker > ENFP fireplace→debate: T/F tie resolves to F via trajectory
✓ computeMBTI — trajectory tiebreaker > INTJ game shelf: S/N tie resolves to N via trajectory
✓ computeMBTI — trajectory tiebreaker > all-zero scores fall back to ESTJ default
✓ path simulation > ENFP fireplace path → ENFP (not ENTP)
✓ path simulation > ENFP kitchen path → ENFP (not INFP)
✓ path simulation > INTJ game shelf path → INTJ (not ISTJ)
✓ path simulation > ISFJ kitchen path → ISFJ (not INFJ)
✓ path simulation > INFP kitchen path → INFP
✓ path simulation > ENTJ path → ENTJ (regression)
10 passed
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Quiz.jsx src/data/quizData.js src/data/quizData.test.js
git commit -m "feat: 9-question quiz with score-based routing and trajectory tiebreaker"
```

---

## Task 8: Smoke test in browser

**Files:** None — verification only.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Navigate to `http://127.0.0.1:5173/portfolio/quiz` (or wherever the quiz route lives).

- [ ] **Step 2: Take the quiz as an ENFP via the kitchen path**

Choose in order:
1. Q1: "The kitchen — wine being poured, a quieter clump of people"
2. Q2: "Always — but let's grab a quieter spot"
3. Q3: "Just listen. Reflect back what you're hearing."
4. Q4 (AB track): "The shape of it — how this could unfold..."
5. Q5: "Back into the group — you want to be in the middle..."
6. Q6: "Keeping the energy — let it go"
7. Q7: "Say yes without thinking"
8. Q8: "For the bit. It's about the stories we'll tell tomorrow"
9. Q9: "You stay until the very last person"

Expected result: **ENFP — The Campaigner**

- [ ] **Step 3: Take the quiz as an INTJ via the game shelf path**

Choose in order:
1. Q1: "The game shelf — you want to see what they've got"
2. Q2: "The weird one with the cryptic cover"
3. Q3: "Explain every rule properly before starting"
4. Q4 (CD track): "You find yourself more interested in watching their strategy"
5. Q5: "The pattern — you've been reading how the table plays"
6. Q6: "Elsewhere — you're already mentally preparing for the next game"
7. Q7: "Execute — you mapped it out, you follow through"
8. Q8: "To win. Read the table, exploit the weak spots"
9. Q9: "You're the first to call it"

Expected result: **INTJ — The Architect**

- [ ] **Step 4: Verify progress bar increments smoothly through all 9 questions**

Progress should advance: 10% → 20% → 30% → 40% → 50% → 60% → 70% → 80% → 90% → 100%

- [ ] **Step 5: Verify Back button works correctly**

On Q5, press back. Confirm you return to Q4 and can re-answer it (routing may re-evaluate). Press back again through Q3 — confirm you return to Q3 and the progress bar decreases correctly.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: quiz accuracy improvements — 9 questions, score-based routing, trajectory tiebreaker"
```
