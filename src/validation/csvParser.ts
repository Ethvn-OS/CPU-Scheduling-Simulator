import type { ProcessDraft } from './processValidation'

const expectedHeaders = ['processId', 'arrivalTime', 'burstTime']

export function parseProcessCsv(input: string): { rows?: ProcessDraft[]; error?: string } {
  const lines = input
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    return { error: 'The CSV file is empty.' }
  }

  const headers = lines[0].split(',').map((header) => header.trim())
  if (headers.length !== expectedHeaders.length || !expectedHeaders.every((header, index) => headers[index] === header)) {
    return { error: 'CSV must include processId, arrivalTime, and burstTime headers.' }
  }

  const rows: ProcessDraft[] = []
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const values = lines[lineIndex].split(',').map((value) => value.trim())
    if (values.length !== expectedHeaders.length) {
      return { error: `Row ${lineIndex + 1} must contain exactly three values.` }
    }

    rows.push({ id: values[0], arrivalTime: values[1], burstTime: values[2] })
  }

  if (rows.length === 0) {
    return { error: 'The CSV file must include at least one process.' }
  }

  return { rows }
}
