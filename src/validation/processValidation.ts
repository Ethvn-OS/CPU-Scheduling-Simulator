import type { ProcessInput } from '../types/scheduling'

export const MAX_PROCESS_COUNT = 100
export const MAX_TIME_VALUE = 1_000_000
export const MAX_TOTAL_BURST_TIME = 1_000_000
export const MAX_ROUND_ROBIN_SLICES = 10_000

export type ProcessDraft = {
  id: string
  arrivalTime: string
  burstTime: string
}

type ValidationResult = {
  processes: ProcessInput[]
  errors: Record<string, string>
}

function isWholeNumber(value: string): boolean {
  return /^\d+$/.test(value.trim())
}

export function validateProcesses(rows: ProcessDraft[]): ValidationResult {
  const errors: Record<string, string> = {}
  const seenIds = new Map<string, number[]>()

  if (rows.length === 0) {
    return { processes: [], errors: { form: 'Add at least one process.' } }
  }

  if (rows.length > MAX_PROCESS_COUNT) {
    return { processes: [], errors: { form: `Use at most ${MAX_PROCESS_COUNT} processes per simulation.` } }
  }

  rows.forEach((row, index) => {
    const id = row.id.trim()

    if (id.length === 0) {
      errors[`${index}.id`] = 'Enter a process ID.'
    } else {
      const matchingIndices = seenIds.get(id) ?? []
      matchingIndices.push(index)
      seenIds.set(id, matchingIndices)
    }

    if (!isWholeNumber(row.arrivalTime)) {
      errors[`${index}.arrivalTime`] = 'Use a non-negative integer.'
    } else if (!Number.isSafeInteger(Number(row.arrivalTime))) {
      errors[`${index}.arrivalTime`] = 'Use an integer within the safe numeric range.'
    } else if (Number(row.arrivalTime) > MAX_TIME_VALUE) {
      errors[`${index}.arrivalTime`] = `Use a value no greater than ${MAX_TIME_VALUE}.`
    }

    if (!isWholeNumber(row.burstTime) || Number(row.burstTime) <= 0) {
      errors[`${index}.burstTime`] = 'Use a positive integer.'
    } else if (!Number.isSafeInteger(Number(row.burstTime))) {
      errors[`${index}.burstTime`] = 'Use an integer within the safe numeric range.'
    } else if (Number(row.burstTime) > MAX_TIME_VALUE) {
      errors[`${index}.burstTime`] = `Use a value no greater than ${MAX_TIME_VALUE}.`
    }
  })

  for (const indices of seenIds.values()) {
    if (indices.length > 1) {
      for (const index of indices) {
        errors[`${index}.id`] = 'Process IDs must be unique.'
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { processes: [], errors }
  }

  const processes = rows.map((row, inputOrder) => ({
    id: row.id.trim(),
    arrivalTime: Number(row.arrivalTime),
    burstTime: Number(row.burstTime),
    inputOrder,
  }))

  // These bounds also keep the final time and sums used for averages safely exact.
  const totalBurstTime = processes.reduce((total, process) => total + process.burstTime, 0)
  if (totalBurstTime > MAX_TOTAL_BURST_TIME) {
    return {
      processes: [],
      errors: { form: `Total CPU burst time must not exceed ${MAX_TOTAL_BURST_TIME} time units.` },
    }
  }

  return { processes, errors }
}

export function validateQuantum(value: string): { value?: number; error?: string } {
  if (!isWholeNumber(value) || Number(value) <= 0) {
    return { error: 'Use a positive integer time quantum.' }
  }

  if (!Number.isSafeInteger(Number(value))) {
    return { error: 'Use a time quantum within the safe integer range.' }
  }

  return { value: Number(value) }
}

// Called after process and quantum validation, before generating any CPU slices.
export function validateRoundRobinWorkload(processes: ProcessInput[], quantum: number): string | undefined {
  const slices = processes.reduce((total, process) => total + Math.ceil(process.burstTime / quantum), 0)
  if (slices > MAX_ROUND_ROBIN_SLICES) {
    return `This run would exceed ${MAX_ROUND_ROBIN_SLICES} CPU slices. Increase the time quantum.`
  }
}
