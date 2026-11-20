import { describe, expect, it } from 'vitest'
import { scheduleFCFS } from './fcfs'
import { scheduleSJF } from './sjf'
import { scheduleRoundRobin } from './roundRobin'
import { calculateSummary } from '../results/summary'
import type { ProcessInput, ScheduleResult } from '../types/scheduling'

type Scheduler = (processes: ProcessInput[]) => ScheduleResult

const schedulers: Array<{ name: string; schedule: Scheduler; roundRobin: boolean }> = [
  { name: 'FCFS', schedule: scheduleFCFS, roundRobin: false },
  { name: 'SJF', schedule: scheduleSJF, roundRobin: false },
  { name: 'Round Robin (quantum 2)', schedule: (processes) => scheduleRoundRobin(processes, 2), roundRobin: true },
]

describe.each(schedulers)('$name edge cases', ({ schedule, roundRobin }) => {
  it('handles an internal idle gap and shuffled arrivals with correct metrics and averages', () => {
    const result = schedule([
      { id: 'P3', arrivalTime: 11, burstTime: 2, inputOrder: 0 },
      { id: 'P1', arrivalTime: 0, burstTime: 5, inputOrder: 1 },
      { id: 'P2', arrivalTime: 10, burstTime: 3, inputOrder: 2 },
    ])

    // Hand-calculated: P1 finishes at 5, then the CPU is idle until 10.
    expect(result.timeline.filter((segment) => segment.reason === 'idle')).toEqual([
      { processId: null, startTime: 5, endTime: 10, reason: 'idle' },
    ])
    expect(result.timeline.map(({ processId, startTime, endTime }) => [processId, startTime, endTime]))
      .toEqual(roundRobin ? [
        ['P1', 0, 2], ['P1', 2, 4], ['P1', 4, 5], [null, 5, 10],
        ['P2', 10, 12], ['P3', 12, 14], ['P2', 14, 15],
      ] : [
        ['P1', 0, 5], [null, 5, 10], ['P2', 10, 13], ['P3', 13, 15],
      ])
    expect(result.metrics).toEqual([
      { processId: 'P3', completionTime: roundRobin ? 14 : 15, turnaroundTime: roundRobin ? 3 : 4, waitingTime: roundRobin ? 1 : 2 },
      { processId: 'P1', completionTime: 5, turnaroundTime: 5, waitingTime: 0 },
      { processId: 'P2', completionTime: roundRobin ? 15 : 13, turnaroundTime: roundRobin ? 5 : 3, waitingTime: roundRobin ? 2 : 0 },
    ])
    const summary = calculateSummary(result)
    expect(summary.averageWaitingTime).toBeCloseTo(roundRobin ? 1 : 2 / 3)
    expect(summary.averageTurnaroundTime).toBeCloseTo(roundRobin ? 13 / 3 : 4)
    expect(summary.cpuUtilization).toBeCloseTo(100 * 10 / 15)
  })

  it('handles initial idle time and a single process without adding waiting time', () => {
    const result = schedule([{ id: 'Only', arrivalTime: 3, burstTime: 5, inputOrder: 0 }])

    expect(result.timeline[0]).toEqual({ processId: null, startTime: 0, endTime: 3, reason: 'idle' })
    expect(result.metrics).toEqual([
      { processId: 'Only', completionTime: 8, turnaroundTime: 5, waitingTime: 0 },
    ])
    expect(calculateSummary(result)).toMatchObject({
      averageWaitingTime: 0, averageTurnaroundTime: 5, contextSwitches: 0,
    })
  })
})

describe('algorithm-specific metric accuracy', () => {
  const processes: ProcessInput[] = [
    { id: 'P3', arrivalTime: 2, burstTime: 2, inputOrder: 0 },
    { id: 'P1', arrivalTime: 0, burstTime: 8, inputOrder: 1 },
    { id: 'P2', arrivalTime: 1, burstTime: 4, inputOrder: 2 },
  ]

  it.each([
    {
      name: 'FCFS', schedule: scheduleFCFS,
      completions: [14, 8, 12], waiting: [10, 0, 7], turnaround: [12, 8, 11],
      averageWT: 17 / 3, averageTAT: 31 / 3,
    },
    {
      name: 'SJF', schedule: scheduleSJF,
      completions: [10, 8, 14], waiting: [6, 0, 9], turnaround: [8, 8, 13],
      averageWT: 5, averageTAT: 29 / 3,
    },
    {
      name: 'Round Robin', schedule: (input: ProcessInput[]) => scheduleRoundRobin(input, 2),
      completions: [6, 14, 10], waiting: [2, 6, 5], turnaround: [4, 14, 9],
      averageWT: 13 / 3, averageTAT: 9,
    },
  ])('$name matches independently calculated completion times, WT, and TAT', ({ schedule, completions, waiting, turnaround, averageWT, averageTAT }) => {
    const result = schedule(processes)

    expect(result.metrics.map((metric) => metric.processId)).toEqual(['P3', 'P1', 'P2'])
    expect(result.metrics.map((metric) => metric.completionTime)).toEqual(completions)
    expect(result.metrics.map((metric) => metric.waitingTime)).toEqual(waiting)
    expect(result.metrics.map((metric) => metric.turnaroundTime)).toEqual(turnaround)
    expect(calculateSummary(result).averageWaitingTime).toBeCloseTo(averageWT)
    expect(calculateSummary(result).averageTurnaroundTime).toBeCloseTo(averageTAT)
  })
})
