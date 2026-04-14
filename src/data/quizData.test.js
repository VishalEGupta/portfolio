import { describe, test, expect } from 'vitest'
import { computeMBTI, scenes, results } from './quizData.js'

describe('result shape — new trading card fields', () => {
  const allTypes = Object.keys(results)

  test.each(allTypes)('%s has a tagline string', (type) => {
    expect(typeof results[type].tagline).toBe('string')
    expect(results[type].tagline.length).toBeGreaterThan(0)
  })

  test.each(allTypes)('%s traits array has exactly 6 items', (type) => {
    expect(results[type].traits).toHaveLength(6)
    results[type].traits.forEach((trait) => expect(typeof trait).toBe('string'))
  })

  test.each(allTypes)('%s tags array has exactly 8 items', (type) => {
    expect(results[type].tags).toHaveLength(8)
    results[type].tags.forEach((tag) => expect(typeof tag).toBe('string'))
  })
})

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
      { I: 1, N: 2, T: 1 },  // Q1: N scored
      { N: 2, P: 1, T: 1 },  // Q2: N scored
      { S: 2, J: 2 },         // Q3: S scored
      { T: 2, J: 1 },         // Q4: neither S nor N
      { J: 2, I: 1, T: 1 },  // Q5: neither
    ]
    expect(computeMBTI(scores, history)).toBe('INTJ')
  })

  test('all-zero scores fall back to ESTJ default', () => {
    expect(computeMBTI({}, [])).toBe('ESTJ')
  })
})

// ─── Path simulation ───────────────────────────────────────────────────────
//
// simulatePath takes an ordered array of [sceneKey, optionIndex] pairs and
// walks the scene graph, accumulating scores exactly as Quiz.jsx does.
// Does NOT call Quiz.jsx — pure scene graph traversal.

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

describe('path simulation — confirmed misclassification fixes', () => {
  test('ENFP fireplace path → ENFP (not ENTP)', () => {
    const result = simulatePath([
      ['q1', 0],     // E:1, S:1, F:1, N:1
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
    const result = simulatePath([
      ['q1', 1],     // I:1, F:2
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

  test('ISFJ kitchen path → ISFJ (not INFJ)', () => {
    const result = simulatePath([
      ['q1', 1],     // I:1, F:2
      ['q2_b', 0],   // I:1, F:2
      ['q3_b', 0],   // I:1, F:2, N:1, P:1  → F=6, T=0 → AB track
      ['q4_ab', 0],  // S:2, J:1  ← concrete/S signal
      ['q5_ab', 2],  // I:1, F:2
      ['q6_ab', 2],  // F:2, I:1
      ['q7_ab', 0],  // J:2
      ['q8', 0],     // T:2, J:1, S:1
      ['q9', 0],     // J:2, T:1
    ])
    expect(result).toBe('ISFJ')
  })

  test('INFP kitchen path → INFP (regression)', () => {
    const result = simulatePath([
      ['q1', 1],     // I:1, F:2
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
      ['q1', 0],     // E:1, S:1, F:1, N:1
      ['q2_a', 0],   // E:2, S:1, P:1
      ['q3_a', 0],   // E:1, T:2, N:1  → T=2, F=1 → CD track
      ['q4_cd', 0],  // T:2, E:1
      ['q5_cd', 1],  // N:2, I:1  ← pattern = N signal (was index 0 = S)
      ['q6_cd', 0],  // E:2, T:1
      ['q7_cd', 0],  // J:2, T:1
      ['q8', 2],     // N:2, P:1, E:1  ← unpredictable play = N (was index 0 = S)
      ['q9', 0],     // J:2, T:1
    ])
    expect(result).toBe('ENTJ')
  })
})

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
      expect(typeof scene.delay).toBe('number')
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

  test('host path with q2d_ext → ISFJ', () => {
    const result = simulatePath([
      ['q1', 3],        // E:1, S:1, F:2, J:1
      ['q2_d', 0],      // S:2, T:1, J:1  — take the kitchen
      ['q2d_ext', 0],   // F:2, I:1  — warmth
      ['q3_d', 0],      // S:1, T:1, J:2  — spring into action
      ['q4_ab', 0],     // S:2, J:1
      ['q5_ab', 2],     // I:1, F:2
      ['q6_ab', 2],     // F:2, I:1
      ['q7_ab', 0],     // J:2
      ['q8', 0],        // T:2, J:1, S:1
      ['q9', 0],        // J:2, T:1
    ])
    expect(result).toBe('ISFJ')
  })

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
})

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
