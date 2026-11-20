import { describe, expect, it } from 'vitest'
import { scheduleRoundRobin } from './roundRobin'

describe('scheduleRoundRobin', () => {
  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects an invalid quantum: %s', (quantum) => {
    expect(() => scheduleRoundRobin([
      { id: 'P1', arrivalTime: 0, burstTime: 1, inputOrder: 0 },
    ], quantum)).toThrow(RangeError)
  })

  it('preserves every quantum boundary in the execution timeline', () => {
    const result = scheduleRoundRobin([
      { id: 'P1', arrivalTime: 0, burstTime: 5, inputOrder: 0 },
      { id: 'P2', arrivalTime: 0, burstTime: 3, inputOrder: 1 },
    ], 2)

    expect(result.timeline).toEqual([
      { processId: 'P1', startTime: 0, endTime: 2, reason: 'quantum-expired' },
      { processId: 'P2', startTime: 2, endTime: 4, reason: 'quantum-expired' },
      { processId: 'P1', startTime: 4, endTime: 6, reason: 'quantum-expired' },
      { processId: 'P2', startTime: 6, endTime: 7, reason: 'completed' },
      { processId: 'P1', startTime: 7, endTime: 8, reason: 'completed' },
    ])
  })

  it('queues arrivals at a quantum boundary before re-adding the unfinished process', () => {
    const result = scheduleRoundRobin([
      { id: 'P1', arrivalTime: 0, burstTime: 4, inputOrder: 0 },
      { id: 'P2', arrivalTime: 2, burstTime: 1, inputOrder: 1 },
    ], 2)

    expect(result.timeline).toEqual([
      { processId: 'P1', startTime: 0, endTime: 2, reason: 'quantum-expired' },
      { processId: 'P2', startTime: 2, endTime: 3, reason: 'completed' },
      { processId: 'P1', startTime: 3, endTime: 5, reason: 'completed' },
    ])
  })

  it('adds idle time when the ready queue is empty', () => {
    const result = scheduleRoundRobin([
      { id: 'P1', arrivalTime: 4, burstTime: 1, inputOrder: 0 },
    ], 2)

    expect(result.timeline).toEqual([
      { processId: null, startTime: 0, endTime: 4, reason: 'idle' },
      { processId: 'P1', startTime: 4, endTime: 5, reason: 'completed' },
    ])
  })
})
