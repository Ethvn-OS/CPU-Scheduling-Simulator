import { describe, expect, it } from 'vitest'
import {
  MAX_PROCESS_COUNT,
  MAX_ROUND_ROBIN_SLICES,
  MAX_TIME_VALUE,
  MAX_TOTAL_BURST_TIME,
  validateProcesses,
  validateQuantum,
  validateRoundRobinWorkload,
} from './processValidation'

describe('validateProcesses', () => {
  it('requires at least one process', () => {
    expect(validateProcesses([])).toEqual({
      processes: [],
      errors: { form: 'Add at least one process.' },
    })
  })

  it('accepts complete, unique process input', () => {
    expect(validateProcesses([
      { id: 'P1', arrivalTime: '0', burstTime: '5' },
      { id: 'P2', arrivalTime: '2', burstTime: '3' },
    ])).toEqual({ processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 5, inputOrder: 0 },
      { id: 'P2', arrivalTime: 2, burstTime: 3, inputOrder: 1 },
    ], errors: {} })
  })

  it('reports empty, duplicate, decimal, negative, and zero values by field', () => {
    const result = validateProcesses([
      { id: '', arrivalTime: '-1', burstTime: '0' },
      { id: 'P2', arrivalTime: '1.5', burstTime: '4' },
      { id: 'P2', arrivalTime: '2', burstTime: '3' },
    ])

    expect(result.processes).toEqual([])
    expect(result.errors).toEqual({
      '0.id': 'Enter a process ID.',
      '0.arrivalTime': 'Use a non-negative integer.',
      '0.burstTime': 'Use a positive integer.',
      '1.arrivalTime': 'Use a non-negative integer.',
      '1.id': 'Process IDs must be unique.',
      '2.id': 'Process IDs must be unique.',
    })
  })
})

describe('validateQuantum', () => {
  it('accepts a positive integer', () => {
    expect(validateQuantum('2')).toEqual({ value: 2 })
  })

  it('rejects zero and decimal values', () => {
    expect(validateQuantum('0')).toEqual({ error: 'Use a positive integer time quantum.' })
    expect(validateQuantum('1.5')).toEqual({ error: 'Use a positive integer time quantum.' })
  })
})

describe('numeric and workload limits', () => {
  it.each(['9007199254740992', '9'.repeat(400)])('rejects unsafe or overflowing process times: %s', (value) => {
    const result = validateProcesses([{ id: 'P1', arrivalTime: value, burstTime: value }])
    expect(result.processes).toEqual([])
    expect(result.errors).toEqual({
      '0.arrivalTime': 'Use an integer within the safe numeric range.',
      '0.burstTime': 'Use an integer within the safe numeric range.',
    })
    expect(validateQuantum(value)).toEqual({ error: 'Use a time quantum within the safe integer range.' })
  })

  it.each(['Infinity', 'NaN', '1e6'])('rejects non-integer text: %s', (value) => {
    expect(validateProcesses([{ id: 'P1', arrivalTime: value, burstTime: value }]).processes).toEqual([])
    expect(validateQuantum(value).error).toBeTruthy()
  })

  it('accepts the maximum allowed times without rounding', () => {
    expect(validateProcesses([{ id: 'P1', arrivalTime: String(MAX_TIME_VALUE), burstTime: String(MAX_TOTAL_BURST_TIME) }]))
      .toEqual({
        processes: [{ id: 'P1', arrivalTime: MAX_TIME_VALUE, burstTime: MAX_TOTAL_BURST_TIME, inputOrder: 0 }],
        errors: {},
      })
    expect(validateQuantum(String(Number.MAX_SAFE_INTEGER))).toEqual({ value: Number.MAX_SAFE_INTEGER })
  })

  it('rejects a time value above the documented limit', () => {
    expect(validateProcesses([{ id: 'P1', arrivalTime: String(MAX_TIME_VALUE + 1), burstTime: String(MAX_TIME_VALUE + 1) }]).errors)
      .toEqual({
        '0.arrivalTime': `Use a value no greater than ${MAX_TIME_VALUE}.`,
        '0.burstTime': `Use a value no greater than ${MAX_TIME_VALUE}.`,
      })
  })

  it('bounds total burst time even when each individual burst is valid', () => {
    const rows = [
      { id: 'P1', arrivalTime: '0', burstTime: String(MAX_TOTAL_BURST_TIME / 2) },
      { id: 'P2', arrivalTime: '0', burstTime: String(MAX_TOTAL_BURST_TIME / 2) },
    ]
    expect(validateProcesses(rows).errors).toEqual({})
    rows[1].burstTime = String(MAX_TOTAL_BURST_TIME / 2 + 1)
    expect(validateProcesses(rows)).toEqual({
      processes: [], errors: { form: `Total CPU burst time must not exceed ${MAX_TOTAL_BURST_TIME} time units.` },
    })
  })

  it('accepts the process-count boundary and rejects a larger list', () => {
    const rows = Array.from({ length: MAX_PROCESS_COUNT }, (_, index) => ({
      id: `P${index}`, arrivalTime: '0', burstTime: '1',
    }))
    expect(validateProcesses(rows).processes).toHaveLength(MAX_PROCESS_COUNT)
    expect(validateProcesses([...rows, { id: 'Extra', arrivalTime: '0', burstTime: '1' }]))
      .toEqual({ processes: [], errors: { form: `Use at most ${MAX_PROCESS_COUNT} processes per simulation.` } })
  })

  it('counts rounded-up slices for each process and allows a larger quantum to resolve an oversized run', () => {
    const processes = [
      { id: 'P1', arrivalTime: 0, burstTime: MAX_ROUND_ROBIN_SLICES - 1, inputOrder: 0 },
      { id: 'P2', arrivalTime: 0, burstTime: 1, inputOrder: 1 },
    ]
    expect(validateRoundRobinWorkload(processes, 1)).toBeUndefined()
    processes[1].burstTime = 2
    expect(validateRoundRobinWorkload(processes, 1)).toBe(
      `This run would exceed ${MAX_ROUND_ROBIN_SLICES} CPU slices. Increase the time quantum.`,
    )
    expect(validateRoundRobinWorkload(processes, 2)).toBeUndefined()
    // Two odd bursts need one more slice than rounding up their combined burst.
    processes[0].burstTime = MAX_ROUND_ROBIN_SLICES * 2 - 1
    processes[1].burstTime = 1
    expect(validateRoundRobinWorkload(processes, 2)).toBeTruthy()
  })
})
