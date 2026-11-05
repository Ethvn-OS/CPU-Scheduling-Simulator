import { useState, type ChangeEvent } from 'react'
import { scheduleFCFS } from '../algorithms/fcfs'
import { scheduleRoundRobin } from '../algorithms/roundRobin'
import { scheduleSJF } from '../algorithms/sjf'
import type { Algorithm, ScheduleResult } from '../types/scheduling'
import { parseProcessCsv } from '../validation/csvParser'
import {
  type ProcessDraft,
  validateProcesses,
  validateQuantum,
} from '../validation/processValidation'

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

const initialProcesses: ProcessDraft[] = [
  { id: 'P1', arrivalTime: '0', burstTime: '5' },
  { id: 'P2', arrivalTime: '1', burstTime: '3' },
  { id: 'P3', arrivalTime: '2', burstTime: '6' },
]

function runAlgorithm(algorithm: Algorithm, rows: ProcessDraft[], quantum: string): {
  result?: ScheduleResult
  errors: Record<string, string>
} {
  const processValidation = validateProcesses(rows)
  if (Object.keys(processValidation.errors).length > 0) {
    return { errors: processValidation.errors }
  }

  if (algorithm === 'round-robin') {
    const quantumValidation = validateQuantum(quantum)
    if (quantumValidation.error) {
      return { errors: { quantum: quantumValidation.error } }
    }

    return { result: scheduleRoundRobin(processValidation.processes, quantumValidation.value!), errors: {} }
  }

  return {
    result: algorithm === 'fcfs'
      ? scheduleFCFS(processValidation.processes)
      : scheduleSJF(processValidation.processes),
    errors: {},
  }
}

export function Workspace({ algorithm, onChangeAlgorithm }: WorkspaceProps) {
  const details = algorithmDetails[algorithm]
  const [processes, setProcesses] = useState<ProcessDraft[]>(initialProcesses)
  const [quantum, setQuantum] = useState('2')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [csvError, setCsvError] = useState('')
  const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(null)

  const updateProcess = (index: number, field: keyof ProcessDraft, value: string) => {
    setProcesses((current) => current.map((process, processIndex) => (
      processIndex === index ? { ...process, [field]: value } : process
    )))
    setErrors((current) => {
      const next = { ...current }
      delete next[`${index}.${field}`]
      return next
    })
    setScheduleResult(null)
  }

  const addProcess = () => {
    setProcesses((current) => [...current, { id: '', arrivalTime: '', burstTime: '' }])
    setScheduleResult(null)
  }

  const removeProcess = (index: number) => {
    setProcesses((current) => current.filter((_, processIndex) => processIndex !== index))
    setErrors({})
    setScheduleResult(null)
  }

  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const parsed = parseProcessCsv(await file.text())
    if (parsed.error) {
      setCsvError(parsed.error)
      return
    }

    setProcesses(parsed.rows!)
    setErrors({})
    setCsvError('')
    setScheduleResult(null)
  }

  const runSimulation = () => {
    const execution = runAlgorithm(algorithm, processes, quantum)
    setErrors(execution.errors)
    setScheduleResult(execution.result ?? null)
  }

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
            <button className="text-button" type="button" onClick={addProcess}>+ Add process</button>
          </div>
          <div className="process-table" role="table" aria-label="Process input">
            <div className="process-row process-row--heading" role="row">
              <span role="columnheader">Process ID</span>
              <span role="columnheader">Arrival time</span>
              <span role="columnheader">CPU burst</span>
              <span aria-hidden="true" />
            </div>
            {processes.map((process, index) => (
              <div className="process-row process-row--editable" role="row" key={index}>
                <label className="table-field" role="cell">
                  <span className="sr-only">Process ID for row {index + 1}</span>
                  <input
                    aria-invalid={Boolean(errors[`${index}.id`])}
                    aria-describedby={errors[`${index}.id`] ? `error-${index}-id` : undefined}
                    value={process.id}
                    onChange={(event) => updateProcess(index, 'id', event.target.value)}
                  />
                  {errors[`${index}.id`] && <small id={`error-${index}-id`}>{errors[`${index}.id`]}</small>}
                </label>
                <label className="table-field" role="cell">
                  <span className="sr-only">Arrival time for {process.id || `row ${index + 1}`}</span>
                  <input
                    inputMode="numeric"
                    aria-invalid={Boolean(errors[`${index}.arrivalTime`])}
                    aria-describedby={errors[`${index}.arrivalTime`] ? `error-${index}-arrival` : undefined}
                    value={process.arrivalTime}
                    onChange={(event) => updateProcess(index, 'arrivalTime', event.target.value)}
                  />
                  {errors[`${index}.arrivalTime`] && <small id={`error-${index}-arrival`}>{errors[`${index}.arrivalTime`]}</small>}
                </label>
                <label className="table-field" role="cell">
                  <span className="sr-only">CPU burst for {process.id || `row ${index + 1}`}</span>
                  <input
                    inputMode="numeric"
                    aria-invalid={Boolean(errors[`${index}.burstTime`])}
                    aria-describedby={errors[`${index}.burstTime`] ? `error-${index}-burst` : undefined}
                    value={process.burstTime}
                    onChange={(event) => updateProcess(index, 'burstTime', event.target.value)}
                  />
                  {errors[`${index}.burstTime`] && <small id={`error-${index}-burst`}>{errors[`${index}.burstTime`]}</small>}
                </label>
                <button className="remove-button" type="button" onClick={() => removeProcess(index)} aria-label={`Remove ${process.id || `row ${index + 1}`}`}>×</button>
              </div>
            ))}
          </div>
          {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
          <div className="input-panel__footer">
            <label className="text-button file-button">
              Import CSV
              <input type="file" accept=".csv,text/csv" onChange={importCsv} />
            </label>
            <a href="/sample-processes.csv" download>Download template</a>
          </div>
          {csvError && <p className="form-error" role="alert">{csvError}</p>}
        </div>

        <aside className="panel run-panel">
          <p className="eyebrow">Active policy</p>
          <div className="algorithm-badge">{details.shortName}</div>
          <h2>Ready to schedule</h2>
          <p>Review the ready queue, then run the selected policy.</p>
          {algorithm === 'round-robin' && (
            <label className="quantum-field">
              <span>Time quantum</span>
              <input
                type="number"
                inputMode="numeric"
                value={quantum}
                aria-invalid={Boolean(errors.quantum)}
                aria-describedby={errors.quantum ? 'quantum-error' : undefined}
                onChange={(event) => {
                  setQuantum(event.target.value)
                  setErrors((current) => ({ ...current, quantum: '' }))
                  setScheduleResult(null)
                }}
              />
              {errors.quantum && <small id="quantum-error" className="field-error">{errors.quantum}</small>}
            </label>
          )}
          <button className="button button--primary" type="button" onClick={runSimulation}>Run simulation</button>
          <p className="run-panel__note">The output preview becomes available after each valid run.</p>
        </aside>
      </section>

      <section className="results-panel" aria-labelledby="results-heading">
        <div className="results-panel__header">
          <div>
            <p className="eyebrow">Execution output</p>
            <h2 id="results-heading">{scheduleResult ? 'Schedule prepared' : 'Results will appear here'}</h2>
          </div>
          <span className="status-chip">{scheduleResult ? 'Validated run' : 'Awaiting run'}</span>
        </div>
        <div className="gantt-placeholder" aria-label="Gantt chart output pending Phase 4">
          <div className="empty-chart-icon" aria-hidden="true"><span /><span /><span /></div>
          <p>
            {scheduleResult
              ? `${scheduleResult.timeline.length} execution segments and ${scheduleResult.metrics.length} process records are ready for Phase 4 visualization.`
              : 'Enter valid process data and run the policy. The Gantt chart, metrics, and dispatch trace will render in Phase 4.'}
          </p>
        </div>
      </section>
    </main>
  )
}
