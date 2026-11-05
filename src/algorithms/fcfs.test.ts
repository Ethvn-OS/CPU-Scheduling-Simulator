import { describe, expect, it } from 'vitest'
import { scheduleFCFS } from './fcfs'

describe('scheduleFCFS', () => {
  it('runs processes in arrival order and preserves input order for ties', () => {
    const result = scheduleFCFS([
      { id: 'P2', arrivalTime: 0, burstTime: 2, inputOrder: 1 },
      { id: 'P1', arrivalTime: 0, burstTime: 3, inputOrder: 0 },
      { id: 'P3', arrivalTime: 1, burstTime: 1, inputOrder: 2 },
    ])

    expect(result.timeline).toEqual([
      { processId: 'P1', startTime: 0, endTime: 3, reason: 'completed' },
      { processId: 'P2', startTime: 3, endTime: 5, reason: 'completed' },
      { processId: 'P3', startTime: 5, endTime: 6, reason: 'completed' },
    ])
  })

  it('represents CPU idle time before a later arrival', () => {
    const result = scheduleFCFS([
      { id: 'P1', arrivalTime: 3, burstTime: 2, inputOrder: 0 },
    ])

    expect(result.timeline).toEqual([
      { processId: null, startTime: 0, endTime: 3, reason: 'idle' },
      { processId: 'P1', startTime: 3, endTime: 5, reason: 'completed' },
    ])
    expect(result.metrics).toEqual([
      { processId: 'P1', completionTime: 5, turnaroundTime: 2, waitingTime: 0 },
    ])
  })
})
