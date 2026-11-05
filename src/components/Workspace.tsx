import type { Algorithm } from '../types/scheduling'

type WorkspaceProps = {
  algorithm: Algorithm
  onChangeAlgorithm: () => void
}

const algorithmDetails: Record<Algorithm, { name: string; shortName: string; description: string }> = {
  fcfs: {
    name: 'First come, first served',
    shortName: 'FCFS',
    description: 'Processes run to completion in arrival order.',
  },
  sjf: {
    name: 'Shortest job first',
    shortName: 'SJF',
    description: 'The shortest arrived job is chosen when the CPU becomes free.',
  },
  'round-robin': {
    name: 'Round robin',
    shortName: 'RR',
    description: 'Ready processes rotate through a fixed time quantum.',
  },
}

const sampleProcesses = [
  { id: 'P1', arrival: 0, burst: 5 },
  { id: 'P2', arrival: 1, burst: 3 },
  { id: 'P3', arrival: 2, burst: 6 },
]

export function Workspace({ algorithm, onChangeAlgorithm }: WorkspaceProps) {
  const details = algorithmDetails[algorithm]

  return (
    <main className="workspace-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Simulation workspace</p>
          <h1>{details.name}</h1>
          <p>{details.description}</p>
        </div>
        <button className="button button--quiet" type="button" onClick={onChangeAlgorithm}>
          Change algorithm
        </button>
      </header>

      <section className="setup-grid" aria-label="Simulation setup">
        <div className="panel input-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Ready queue input</p>
              <h2>Processes</h2>
            </div>
            <button className="text-button" type="button" disabled>+ Add process</button>
          </div>
          <div className="process-table" role="table" aria-label="Sample processes">
            <div className="process-row process-row--heading" role="row">
              <span role="columnheader">Process ID</span>
              <span role="columnheader">Arrival time</span>
              <span role="columnheader">CPU burst</span>
              <span aria-hidden="true" />
            </div>
            {sampleProcesses.map((process) => (
              <div className="process-row" role="row" key={process.id}>
                <span role="cell">{process.id}</span>
                <span role="cell">{process.arrival}</span>
                <span role="cell">{process.burst}</span>
                <button className="remove-button" type="button" disabled aria-label={`Remove ${process.id}`}>×</button>
              </div>
            ))}
          </div>
          <div className="input-panel__footer">
            <span>Process editing and CSV import arrive in Phase 3</span>
          </div>
        </div>

        <aside className="panel run-panel">
          <p className="eyebrow">Active policy</p>
          <div className="algorithm-badge">{details.shortName}</div>
          <h2>Ready to schedule</h2>
          <p>Review the ready queue, then run the selected policy.</p>
          {algorithm === 'round-robin' && (
            <label className="quantum-field">
              <span>Time quantum</span>
              <input type="number" defaultValue="2" min="1" aria-label="Time quantum" />
            </label>
          )}
          <button className="button button--primary" type="button" disabled>Run simulation</button>
          <p className="run-panel__note">The scheduling engine will be connected in Phase 2.</p>
        </aside>
      </section>

      <section className="results-panel" aria-labelledby="results-heading">
        <div className="results-panel__header">
          <div>
            <p className="eyebrow">Execution output</p>
            <h2 id="results-heading">Results will appear here</h2>
          </div>
          <span className="status-chip">Awaiting run</span>
        </div>
        <div className="gantt-placeholder" aria-label="Empty Gantt chart">
          <div className="empty-chart-icon" aria-hidden="true"><span /><span /><span /></div>
          <p>The Gantt chart, metrics, and dispatch trace will render after the scheduling engine is implemented in Phase 2.</p>
        </div>
      </section>
    </main>
  )
}
