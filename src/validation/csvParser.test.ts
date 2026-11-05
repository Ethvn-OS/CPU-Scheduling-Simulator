import { describe, expect, it } from 'vitest'
import { parseProcessCsv } from './csvParser'

describe('parseProcessCsv', () => {
  it('parses a valid process CSV and ignores blank lines', () => {
    expect(parseProcessCsv('processId,arrivalTime,burstTime\nP1,0,5\n\nP2,2,3\n')).toEqual({
      rows: [
        { id: 'P1', arrivalTime: '0', burstTime: '5' },
        { id: 'P2', arrivalTime: '2', burstTime: '3' },
      ],
    })
  })

  it('reports missing headers and malformed rows', () => {
    expect(parseProcessCsv('processId,arrivalTime\nP1,0')).toEqual({
      error: 'CSV must include processId, arrivalTime, and burstTime headers.',
    })
    expect(parseProcessCsv('processId,arrivalTime,burstTime\nP1,0')).toEqual({
      error: 'Row 2 must contain exactly three values.',
    })
  })
})
