import { describe, test, expect } from 'vitest'
import { computeMBTI, scenes } from './quizData.js'

describe('quizData', () => {
  test('computeMBTI should be a function', () => {
    expect(typeof computeMBTI).toBe('function')
  })

  test('scenes should be an object', () => {
    expect(typeof scenes).toBe('object')
  })
})
