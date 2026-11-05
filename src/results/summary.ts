import type { ScheduleResult } from '../types/scheduling'

export type ScheduleSummary = {
  averageTurnaroundTime: number
  averageWaitingTime: number
  cpuUtilization: number
  throughput: number
  contextSwitches: number
}

export function calculateSummary(result: ScheduleResult): ScheduleSummary {
  if (result.metrics.length === 0 || result.timeline.length === 0) {
    return {
      averageTurnaroundTime: 0,
      averageWaitingTime: 0,
      cpuUtilization: 0,
      throughput: 0,
      contextSwitches: 0,
    }
  }

  const totalElapsedTime = result.timeline[result.timeline.length - 1].endTime
  const busyTime = result.timeline.reduce(
    (total, segment) => total + (segment.processId === null ? 0 : segment.endTime - segment.startTime),
    0,
  )
  let previousProcessId: string | null = null
  let contextSwitches = 0

  for (const segment of result.timeline) {
    if (segment.processId !== null) {
      if (previousProcessId !== null && previousProcessId !== segment.processId) {
        contextSwitches += 1
      }
      previousProcessId = segment.processId
    }
  }

  return {
    averageTurnaroundTime: result.metrics.reduce((total, metric) => total + metric.turnaroundTime, 0) / result.metrics.length,
    averageWaitingTime: result.metrics.reduce((total, metric) => total + metric.waitingTime, 0) / result.metrics.length,
    cpuUtilization: totalElapsedTime === 0 ? 0 : (busyTime / totalElapsedTime) * 100,
    throughput: totalElapsedTime === 0 ? 0 : result.metrics.length / totalElapsedTime,
    contextSwitches,
  }
}
