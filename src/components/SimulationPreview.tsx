import { scheduleFCFS } from '../algorithms/fcfs'
import { calculateSummary } from '../results/summary'
import type { ProcessInput } from '../types/scheduling'
import { GanttChart } from './GanttChart'

const sampleProcesses: ProcessInput[] = [
  { id: 'P1', arrivalTime: 0, burstTime: 5, inputOrder: 0 },
  { id: 'P2', arrivalTime: 1, burstTime: 3, inputOrder: 1 },
  { id: 'P3', arrivalTime: 2, burstTime: 2, inputOrder: 2 },
]
const sampleResult = scheduleFCFS(sampleProcesses)
const sampleSummary = calculateSummary(sampleResult)

export function SimulationPreview() {
  return (
    <section className="simulation-preview" aria-labelledby="preview-heading">
      <header className="simulation-preview__header">
        <h2 id="preview-heading">Simulation preview</h2>
        <span className="simulation-preview__policy">FCFS · Sample run</span>
      </header>

      <div className="simulation-preview__queue">
        <span className="simulation-preview__label">Ready queue</span>
        <ul className="simulation-preview__processes" aria-label="Sample process inputs">
          {sampleProcesses.map((process) => (
            <li key={process.id} aria-label={`${process.id}: arrival ${process.arrivalTime}, burst ${process.burstTime}`}>
              <strong>{process.id}</strong>
              <span>arrival {process.arrivalTime} · burst {process.burstTime}</span>
            </li>
          ))}
        </ul>
      </div>

      <GanttChart timeline={sampleResult.timeline} compact />

      <dl className="simulation-preview__metrics" aria-label="Sample schedule averages">
        <div>
          <dt>Average waiting</dt>
          <dd>{sampleSummary.averageWaitingTime.toFixed(2)} <span>time units</span></dd>
        </div>
        <div>
          <dt>Average turnaround</dt>
          <dd>{sampleSummary.averageTurnaroundTime.toFixed(2)} <span>time units</span></dd>
        </div>
      </dl>
    </section>
  )
}
