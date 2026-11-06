import { scheduleFCFS } from './algorithms/fcfs'
import { scheduleRoundRobin } from './algorithms/roundRobin'
import { scheduleSJF } from './algorithms/sjf'
import type { ProcessInput, ScheduleResult } from './types/scheduling'

const processes: ProcessInput[] = [
  { id: 'P1', arrivalTime: 0, burstTime: 8, inputOrder: 0 },
  { id: 'P2', arrivalTime: 1, burstTime: 4, inputOrder: 1 },
  { id: 'P3', arrivalTime: 2, burstTime: 2, inputOrder: 2 },
]
const quantum = 2

function formatRow(values: Array<string | number>, widths: number[]): string {
  return values
    .map((value, index) => String(value).padEnd(widths[index]))
    .join('')
    .trimEnd()
}

function printProcessInput(): void {
  console.log('Hard-coded processes:')
  console.log(formatRow(['Process', 'Arrival', 'Burst'], [9, 9, 5]))

  for (const process of processes) {
    console.log(formatRow(
      [process.id, process.arrivalTime, process.burstTime],
      [9, 9, 5],
    ))
  }
}

function printSchedule(name: string, result: ScheduleResult): void {
  const executionOrder = result.timeline
    .map((segment) => segment.processId)
    .filter((processId): processId is string => processId !== null)

  console.log(`\n=== ${name} ===`)
  console.log(`Execution order: ${executionOrder.join(' -> ')}`)
  console.log('')
  console.log(formatRow(['Process', 'Completion', 'Turnaround', 'Waiting'], [9, 12, 12, 7]))

  for (const metrics of result.metrics) {
    console.log(formatRow(
      [
        metrics.processId,
        metrics.completionTime,
        metrics.turnaroundTime,
        metrics.waitingTime,
      ],
      [9, 12, 12, 7],
    ))
  }
}

console.log('CPU Scheduling Simulator - Backend Demonstration\n')
printProcessInput()
printSchedule('First Come, First Served (FCFS)', scheduleFCFS(processes))
printSchedule('Non-preemptive Shortest Job First (SJF)', scheduleSJF(processes))
printSchedule(
  `Round Robin (Quantum = ${quantum})`,
  scheduleRoundRobin(processes, quantum),
)
