import { describe, expect, it } from 'vitest'
import { scheduleSJF } from './sjf'

describe('scheduleSJF', () => {
  it('chooses the shortest process among processes that have arrived', () => {
    const result = scheduleSJF([
      { id: 'P1', arrivalTime: 0, burstTime: 8, inputOrder: 0 },
      { id: 'P2', arrivalTime: 1, burstTime: 4, inputOrder: 1 },
      { id: 'P3', arrivalTime: 2, burstTime: 2, inputOrder: 2 },
    ])

    expect(result.timeline.map((segment) => segment.processId)).toEqual(['P1', 'P3', 'P2'])
  })

  it('breaks identical burst-time ties by arrival time, then input order', () => {
    const result = scheduleSJF([
      { id: 'P3', arrivalTime: 0, burstTime: 4, inputOrder: 2 },
      { id: 'P2', arrivalTime: 0, burstTime: 4, inputOrder: 1 },
      { id: 'P1', arrivalTime: 0, burstTime: 4, inputOrder: 0 },
    ])

    expect(result.timeline.map((segment) => segment.processId)).toEqual(['P1', 'P2', 'P3'])
  })

  it('does not preempt a running process when a shorter process arrives', () => {
    const result = scheduleSJF([
      { id: 'P1', arrivalTime: 0, burstTime: 6, inputOrder: 0 },
      { id: 'P2', arrivalTime: 1, burstTime: 1, inputOrder: 1 },
    ])

    expect(result.timeline).toEqual([
      { processId: 'P1', startTime: 0, endTime: 6, reason: 'completed' },
      { processId: 'P2', startTime: 6, endTime: 7, reason: 'completed' },
    ])
  })
})
