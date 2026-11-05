# CPU Scheduling Simulator

An interactive Operating Systems final project built with React, TypeScript, and Vite. It will simulate FCFS, non-preemptive SJF, and Round Robin CPU scheduling.

## Commands

```powershell
npm install
npm run dev
npm run build
npm run lint
```

## Project Phases

1. Foundation and navigable wireframes.
2. Test-driven FCFS, SJF, and Round Robin scheduling engine.
3. Process validation and CSV import.
4. Connect inputs and algorithms.
5. Gantt chart and performance metrics.
6. Accessibility, responsive polish, and defense preparation.

## Scheduling Assumptions

- FCFS selects by arrival time; equal arrivals preserve original input order.
- SJF selects the shortest arrived job when the CPU is available. Ties resolve by arrival time, then original input order.
- Round Robin enqueues by arrival time. At a quantum boundary, newly arrived processes enter the ready queue before the unfinished process is re-enqueued.
- CPU idle periods will appear explicitly in the execution timeline.

## Metrics

- Turnaround time = completion time - arrival time
- Waiting time = turnaround time - burst time
