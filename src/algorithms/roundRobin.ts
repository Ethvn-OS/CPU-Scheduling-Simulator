import { calculateMetrics } from './metrics'
import type { ProcessInput, ScheduleResult, TimelineSegment } from '../types/scheduling'

type QueuedProcess = ProcessInput & { remainingTime: number }

export function scheduleRoundRobin(processes: ProcessInput[], quantum: number): ScheduleResult {
  if (!Number.isInteger(quantum) || quantum <= 0) {
    throw new RangeError('Round Robin quantum must be a positive integer.')
  }

  const orderedProcesses = [...processes].sort(
    (first, second) => first.arrivalTime - second.arrivalTime || first.inputOrder - second.inputOrder,
  )
  const timeline: TimelineSegment[] = []
  const readyQueue: QueuedProcess[] = []
  let nextProcessIndex = 0
  let currentTime = 0

  const enqueueArrivals = () => {
    while (
      nextProcessIndex < orderedProcesses.length
      && orderedProcesses[nextProcessIndex].arrivalTime <= currentTime
    ) {
      const process = orderedProcesses[nextProcessIndex]
      readyQueue.push({ ...process, remainingTime: process.burstTime })
      nextProcessIndex += 1
    }
  }

  while (readyQueue.length > 0 || nextProcessIndex < orderedProcesses.length) {
    enqueueArrivals()

    if (readyQueue.length === 0) {
      const nextArrival = orderedProcesses[nextProcessIndex].arrivalTime
      timeline.push({ processId: null, startTime: currentTime, endTime: nextArrival, reason: 'idle' })
      currentTime = nextArrival
      enqueueArrivals()
    }

    const currentProcess = readyQueue.shift()
    if (!currentProcess) {
      continue
    }

    const duration = Math.min(currentProcess.remainingTime, quantum)
    currentTime += duration
    currentProcess.remainingTime -= duration

    // New arrivals get their fair queue position before the unfinished process returns.
    enqueueArrivals()
    timeline.push({
      processId: currentProcess.id,
      startTime: currentTime - duration,
      endTime: currentTime,
      reason: currentProcess.remainingTime === 0 ? 'completed' : 'quantum-expired',
    })

    if (currentProcess.remainingTime > 0) {
      readyQueue.push(currentProcess)
    }
  }

  return { timeline, metrics: calculateMetrics(processes, timeline) }
}
