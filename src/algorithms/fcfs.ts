import { calculateMetrics } from './metrics'
import type { ProcessInput, ScheduleResult, TimelineSegment } from '../types/scheduling'

export function scheduleFCFS(processes: ProcessInput[]): ScheduleResult {
  const timeline: TimelineSegment[] = []
  let currentTime = 0

  const orderedProcesses = [...processes].sort(
    (first, second) => first.arrivalTime - second.arrivalTime || first.inputOrder - second.inputOrder,
  )

  for (const process of orderedProcesses) {
    if (currentTime < process.arrivalTime) {
      timeline.push({
        processId: null,
        startTime: currentTime,
        endTime: process.arrivalTime,
        reason: 'idle',
      })
      currentTime = process.arrivalTime
    }

    timeline.push({
      processId: process.id,
      startTime: currentTime,
      endTime: currentTime + process.burstTime,
      reason: 'completed',
    })
    currentTime += process.burstTime
  }

  return { timeline, metrics: calculateMetrics(processes, timeline) }
}
