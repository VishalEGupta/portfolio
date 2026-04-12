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
      { T: 2, J: 1 },         // Q4: neither S nor N
      { J: 2, I: 1, T: 1 },  // Q5: neither
    ]
    expect(computeMBTI(scores, history)).toBe('INTJ')
  })

  test('all-zero scores fall back to ESTJ default', () => {
    expect(computeMBTI({}, [])).toBe('ESTJ')
  })
})
