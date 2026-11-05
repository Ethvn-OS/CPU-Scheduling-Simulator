import { calculateSummary } from '../results/summary'
import type { ProcessInput, ScheduleResult } from '../types/scheduling'
import { GanttChart } from './GanttChart'

type ScheduleResultsProps = {
  result: ScheduleResult
  processes: ProcessInput[]
}

const formatNumber = (value: number, digits = 2) => Number.isInteger(value) ? String(value) : value.toFixed(digits)

export function ScheduleResults({ result, processes }: ScheduleResultsProps) {
  const summary = calculateSummary(result)
  const processById = new Map(processes.map((process) => [process.id, process]))

  return (
    <section className="results-panel results-panel--complete" aria-labelledby="results-heading">
      <div className="results-panel__header">
        <div>
          <p className="eyebrow">Execution output</p>
          <h2 id="results-heading">Schedule complete</h2>
        </div>
        <span className="status-chip status-chip--complete">Validated run</span>
      </div>

      <GanttChart timeline={result.timeline} />

      <div className="summary-grid" aria-label="Schedule summary">
        <article><span>Average turnaround</span><strong>{formatNumber(summary.averageTurnaroundTime)}</strong><small>time units</small></article>
        <article><span>Average waiting</span><strong>{formatNumber(summary.averageWaitingTime)}</strong><small>time units</small></article>
        <article><span>CPU utilization</span><strong>{formatNumber(summary.cpuUtilization)}%</strong><small>busy / elapsed time</small></article>
        <article><span>Context switches</span><strong>{summary.contextSwitches}</strong><small>process transitions</small></article>
      </div>

      <div className="metrics-table-wrap">
        <table className="metrics-table">
          <caption>Per-process performance metrics</caption>
          <thead>
            <tr>
              <th>Process</th>
              <th>Arrival</th>
              <th>Burst</th>
              <th>Completion</th>
              <th>Turnaround</th>
              <th>Waiting</th>
            </tr>
          </thead>
          <tbody>
            {result.metrics.map((metric) => {
              const process = processById.get(metric.processId)
              return (
                <tr key={metric.processId}>
                  <th scope="row">{metric.processId}</th>
                  <td>{process?.arrivalTime ?? '-'}</td>
                  <td>{process?.burstTime ?? '-'}</td>
                  <td>{metric.completionTime}</td>
                  <td>{metric.turnaroundTime}</td>
                  <td>{metric.waitingTime}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="throughput-note">Throughput: {formatNumber(summary.throughput, 3)} completed processes per time unit.</p>
    </section>
  )
}
