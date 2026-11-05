import { calculateMetrics } from './metrics'
import type { ProcessInput, ScheduleResult, TimelineSegment } from '../types/scheduling'

export function scheduleSJF(processes: ProcessInput[]): ScheduleResult {
  const timeline: TimelineSegment[] = []
  const waiting = [...processes]
  let currentTime = 0

  while (waiting.length > 0) {
    const available = waiting
      .filter((process) => process.arrivalTime <= currentTime)
      .sort((first, second) => (
        first.burstTime - second.burstTime
        || first.arrivalTime - second.arrivalTime
        || first.inputOrder - second.inputOrder
      ))

    if (available.length === 0) {
      const nextArrival = Math.min(...waiting.map((process) => process.arrivalTime))
      timeline.push({ processId: null, startTime: currentTime, endTime: nextArrival, reason: 'idle' })
      currentTime = nextArrival
      continue
    }

    const selected = available[0]
    const selectedIndex = waiting.indexOf(selected)
    waiting.splice(selectedIndex, 1)
    timeline.push({
      processId: selected.id,
      startTime: currentTime,
      endTime: currentTime + selected.burstTime,
      reason: 'completed',
    })
    currentTime += selected.burstTime
  }

  return { timeline, metrics: calculateMetrics(processes, timeline) }
}
