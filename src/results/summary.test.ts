import { describe, expect, it } from 'vitest'
import { calculateSummary } from './summary'

describe('calculateSummary', () => {
  it('calculates averages and system metrics from a completed schedule', () => {
    expect(calculateSummary({
      timeline: [
        { processId: null, startTime: 0, endTime: 2, reason: 'idle' },
        { processId: 'P1', startTime: 2, endTime: 5, reason: 'completed' },
        { processId: 'P2', startTime: 5, endTime: 7, reason: 'completed' },
      ],
      metrics: [
        { processId: 'P1', completionTime: 5, turnaroundTime: 3, waitingTime: 0 },
        { processId: 'P2', completionTime: 7, turnaroundTime: 6, waitingTime: 4 },
      ],
    })).toEqual({
      averageTurnaroundTime: 4.5,
      averageWaitingTime: 2,
      cpuUtilization: expect.closeTo(71.42857142857143),
      throughput: expect.closeTo(0.2857142857142857),
      contextSwitches: 1,
    })
  })
})
