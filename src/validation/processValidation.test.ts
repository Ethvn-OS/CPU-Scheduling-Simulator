import { describe, expect, it } from 'vitest'
import { validateProcesses, validateQuantum } from './processValidation'

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
