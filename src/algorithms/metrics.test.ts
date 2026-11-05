import { describe, expect, it } from 'vitest'
import { calculateMetrics } from './metrics'

describe('calculateMetrics', () => {
  it('uses the final slice of a process as its completion time', () => {
    const metrics = calculateMetrics(
      [
        { id: 'P1', arrivalTime: 0, burstTime: 3, inputOrder: 0 },
        { id: 'P2', arrivalTime: 1, burstTime: 1, inputOrder: 1 },
      ],
      [
        { processId: 'P1', startTime: 0, endTime: 2, reason: 'quantum-expired' },
        { processId: 'P2', startTime: 2, endTime: 3, reason: 'completed' },
        { processId: 'P1', startTime: 3, endTime: 4, reason: 'completed' },
      ],
    )

    expect(metrics).toEqual([
      { processId: 'P1', completionTime: 4, turnaroundTime: 4, waitingTime: 1 },
      { processId: 'P2', completionTime: 3, turnaroundTime: 2, waitingTime: 1 },
    ])
  })
})
