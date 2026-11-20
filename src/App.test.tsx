import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('application navigation', () => {
  it('moves from the landing page to a selected algorithm workspace', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /start simulation/i }))
    fireEvent.click(screen.getByRole('button', { name: /round robin/i }))

    expect(screen.getByRole('heading', { name: /round robin/i })).toBeTruthy()
    expect(screen.getByRole('spinbutton', { name: /time quantum/i })).toBeTruthy()
  })
})

function openWorkspace(algorithm: RegExp) {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /start simulation/i }))
  fireEvent.click(screen.getByRole('button', { name: algorithm }))
}

function enterProcesses(processes: Array<[string, string, string]>) {
  const rows = within(screen.getByRole('table', { name: 'Process input' })).getAllByRole('row').slice(1)
  processes.forEach((values, index) => {
    const inputs = within(rows[index]).getAllByRole('textbox')
    values.forEach((value, field) => fireEvent.change(inputs[field], { target: { value } }))
  })
}

function runSimulation() {
  fireEvent.click(screen.getByRole('button', { name: /run simulation/i }))
}

function metricRows() {
  return within(screen.getByRole('table', { name: /per-process performance metrics/i }))
    .getAllByRole('row').slice(1)
    .map((row) => Array.from(row.children, (cell) => cell.textContent))
}

function summaryValue(label: string) {
  return screen.getByText(label).parentElement?.querySelector('strong')?.textContent
}

describe('complete simulation workflow', () => {
  it.each([
    {
      algorithm: /first come, first served/i,
      rows: [
        ['P3', '2', '2', '14', '12', '10'],
        ['P1', '0', '8', '8', '8', '0'],
        ['P2', '1', '4', '12', '11', '7'],
      ],
      intervals: ['P1: 0 to 8 (8 units)', 'P2: 8 to 12 (4 units)', 'P3: 12 to 14 (2 units)'],
      averageWT: '5.67', averageTAT: '10.33',
    },
    {
      algorithm: /shortest job first/i,
      rows: [
        ['P3', '2', '2', '10', '8', '6'],
        ['P1', '0', '8', '8', '8', '0'],
        ['P2', '1', '4', '14', '13', '9'],
      ],
      intervals: ['P1: 0 to 8 (8 units)', 'P3: 8 to 10 (2 units)', 'P2: 10 to 14 (4 units)'],
      averageWT: '5', averageTAT: '9.67',
    },
    {
      algorithm: /round robin/i,
      rows: [
        ['P3', '2', '2', '6', '4', '2'],
        ['P1', '0', '8', '14', '14', '6'],
        ['P2', '1', '4', '10', '9', '5'],
      ],
      intervals: [
        'P1: 0 to 2 (2 units)', 'P2: 2 to 4 (2 units)', 'P3: 4 to 6 (2 units)',
        'P1: 6 to 8 (2 units)', 'P2: 8 to 10 (2 units)', 'P1: 10 to 12 (2 units)',
        'P1: 12 to 14 (2 units)',
      ],
      averageWT: '4.33', averageTAT: '9',
    },
  ])('passes inputs to $algorithm and displays the correct chart, metrics, and averages', ({ algorithm, rows, intervals, averageWT, averageTAT }) => {
    openWorkspace(algorithm)
    enterProcesses([['P3', '2', '2'], ['P1', '0', '8'], ['P2', '1', '4']])
    if (algorithm.test('round robin')) {
      fireEvent.change(screen.getByRole('spinbutton', { name: /time quantum/i }), { target: { value: '2' } })
    }
    runSimulation()

    expect(metricRows()).toEqual(rows)
    expect(summaryValue('Average waiting')).toBe(averageWT)
    expect(summaryValue('Average turnaround')).toBe(averageTAT)
    const chart = screen.getByRole('figure', { name: /CPU execution timeline/i })
    expect(Array.from(chart.querySelectorAll('[title]'), (block) => block.getAttribute('title'))).toEqual(intervals)
    expect(within(chart).queryAllByText('slice')).toHaveLength(algorithm.test('round robin') ? 4 : 0)
  })

  it.each([
    { algorithm: /first come, first served/i, averageWT: '0.67', averageTAT: '4' },
    { algorithm: /shortest job first/i, averageWT: '0.67', averageTAT: '4' },
    { algorithm: /round robin/i, averageWT: '1', averageTAT: '4.33' },
  ])('displays an internal idle gap for $algorithm', ({ algorithm, averageWT, averageTAT }) => {
    openWorkspace(algorithm)
    enterProcesses([['P3', '11', '2'], ['P1', '0', '5'], ['P2', '10', '3']])
    runSimulation()

    expect(screen.getByTitle('Idle: 5 to 10 (5 units)').textContent).toBe('Idle')
    expect(summaryValue('Average waiting')).toBe(averageWT)
    expect(summaryValue('Average turnaround')).toBe(averageTAT)
  })

  it('clears stale results after an edit and recalculates on the next run', () => {
    openWorkspace(/first come, first served/i)
    runSimulation()
    fireEvent.change(screen.getByRole('textbox', { name: 'CPU burst for P1' }), { target: { value: '2' } })
    expect(screen.queryByRole('figure', { name: /CPU execution timeline/i })).toBeNull()
    runSimulation()
    expect(metricRows()).toEqual([
      ['P1', '0', '2', '2', '2', '0'],
      ['P2', '1', '3', '5', '4', '1'],
      ['P3', '2', '6', '11', '9', '3'],
    ])
  })

  it('rejects invalid process input without displaying a schedule', () => {
    openWorkspace(/first come, first served/i)
    fireEvent.change(screen.getByRole('textbox', { name: 'CPU burst for P1' }), { target: { value: '0' } })
    runSimulation()
    expect(screen.getByText('Use a positive integer.')).toBeTruthy()
    expect(screen.queryByRole('figure', { name: /CPU execution timeline/i })).toBeNull()
  })

  it('rejects an invalid quantum, then uses the corrected value and clears stale results on changes', () => {
    openWorkspace(/round robin/i)
    const quantum = screen.getByRole('spinbutton', { name: /time quantum/i })
    fireEvent.change(quantum, { target: { value: '0' } })
    runSimulation()
    expect(screen.getByText('Use a positive integer time quantum.')).toBeTruthy()
    expect(screen.queryByRole('figure', { name: /CPU execution timeline/i })).toBeNull()
    fireEvent.change(quantum, { target: { value: '3' } })
    runSimulation()
    expect(screen.getByTitle('P1: 0 to 3 (3 units)')).toBeTruthy()
    fireEvent.change(quantum, { target: { value: '1' } })
    expect(screen.queryByRole('figure', { name: /CPU execution timeline/i })).toBeNull()
    runSimulation()
    expect(screen.getByTitle('P1: 0 to 1 (1 unit)')).toBeTruthy()
  })

  it('imports CSV rows and schedules their actual values', async () => {
    openWorkspace(/first come, first served/i)
    runSimulation()
    const contents = 'processId,arrivalTime,burstTime\nLater,10,3\nEarly,0,5\n'
    const file = new File([contents], 'processes.csv', { type: 'text/csv' })
    fireEvent.change(screen.getByLabelText(/import csv/i), { target: { files: [file] } })

    expect(await screen.findByRole('textbox', { name: 'CPU burst for Early' })).toBeTruthy()
    expect(screen.queryByRole('figure', { name: /CPU execution timeline/i })).toBeNull()
    runSimulation()
    expect(metricRows()).toEqual([
      ['Later', '10', '3', '13', '3', '0'], ['Early', '0', '5', '5', '5', '0'],
    ])
    expect(screen.getByTitle('Idle: 5 to 10 (5 units)')).toBeTruthy()
  })

  it('blocks an oversized Round Robin workload before scheduling and accepts a larger quantum', () => {
    openWorkspace(/round robin/i)
    enterProcesses([['P1', '0', '10001'], ['P2', '0', '1'], ['P3', '0', '1']])
    const quantum = screen.getByRole('spinbutton', { name: /time quantum/i })
    fireEvent.change(quantum, { target: { value: '1' } })
    runSimulation()
    expect(screen.getByText('This run would exceed 10000 CPU slices. Increase the time quantum.')).toBeTruthy()
    expect(screen.queryByRole('figure', { name: /CPU execution timeline/i })).toBeNull()
    fireEvent.change(quantum, { target: { value: '10000' } })
    runSimulation()
    expect(metricRows()).toEqual([
      ['P1', '0', '10001', '10003', '10003', '2'],
      ['P2', '0', '1', '10001', '10001', '10000'],
      ['P3', '0', '1', '10002', '10002', '10001'],
    ])
  })

  it('rejects unsafe numeric input and imported workloads that exceed the total burst limit', async () => {
    openWorkspace(/first come, first served/i)
    fireEvent.change(screen.getByRole('textbox', { name: 'Arrival time for P1' }), { target: { value: '9007199254740992' } })
    runSimulation()
    expect(screen.getByText('Use an integer within the safe numeric range.')).toBeTruthy()
    expect(screen.queryByRole('figure', { name: /CPU execution timeline/i })).toBeNull()

    const file = new File(['processId,arrivalTime,burstTime\nA,0,1000000\nB,0,1'], 'large.csv', { type: 'text/csv' })
    fireEvent.change(screen.getByLabelText(/import csv/i), { target: { files: [file] } })
    await screen.findByRole('textbox', { name: 'CPU burst for B' })
    runSimulation()
    expect(screen.getByRole('alert').textContent).toBe('Total CPU burst time must not exceed 1000000 time units.')
    expect(screen.queryByRole('figure', { name: /CPU execution timeline/i })).toBeNull()
  })
})
