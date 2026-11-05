export type Algorithm = 'fcfs' | 'sjf' | 'round-robin'

export type AppScreen = 'landing' | 'algorithm-selection' | 'workspace'

export type ProcessInput = {
  id: string
  arrivalTime: number
  burstTime: number
  inputOrder: number
}

export type TimelineSegment = {
  processId: string | null
  startTime: number
  endTime: number
  reason: 'completed' | 'quantum-expired' | 'idle'
}

export type ProcessMetrics = {
  processId: string
  completionTime: number
  turnaroundTime: number
  waitingTime: number
}

export type ScheduleResult = {
  timeline: TimelineSegment[]
  metrics: ProcessMetrics[]
}
