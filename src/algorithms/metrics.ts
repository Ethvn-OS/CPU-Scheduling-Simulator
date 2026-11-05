import type { ProcessInput, ProcessMetrics, TimelineSegment } from '../types/scheduling'

export function calculateMetrics(
  processes: ProcessInput[],
  timeline: TimelineSegment[],
): ProcessMetrics[] {
  const completionTimes = new Map<string, number>()

  for (const segment of timeline) {
    if (segment.processId !== null) {
      completionTimes.set(segment.processId, segment.endTime)
    }
  }

  return [...processes]
    .sort((first, second) => first.inputOrder - second.inputOrder)
    .map((process) => {
      const completionTime = completionTimes.get(process.id)

      if (completionTime === undefined) {
        throw new Error(`No completion time was recorded for ${process.id}.`)
      }

      const turnaroundTime = completionTime - process.arrivalTime

      return {
        processId: process.id,
        completionTime,
        turnaroundTime,
        waitingTime: turnaroundTime - process.burstTime,
      }
    })
}
