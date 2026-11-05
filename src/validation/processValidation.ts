import type { ProcessInput } from '../types/scheduling'

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
    }

    if (!isWholeNumber(row.burstTime) || Number(row.burstTime) <= 0) {
      errors[`${index}.burstTime`] = 'Use a positive integer.'
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

  return {
    processes: rows.map((row, inputOrder) => ({
      id: row.id.trim(),
      arrivalTime: Number(row.arrivalTime),
      burstTime: Number(row.burstTime),
      inputOrder,
    })),
    errors,
  }
}

export function validateQuantum(value: string): { value?: number; error?: string } {
  if (!isWholeNumber(value) || Number(value) <= 0) {
    return { error: 'Use a positive integer time quantum.' }
  }

  return { value: Number(value) }
}
