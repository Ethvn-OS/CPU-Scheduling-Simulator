import type { Algorithm } from '../types/scheduling'
import { AlgorithmIllustration } from './AlgorithmIllustration'

type AlgorithmCardsProps = {
  onSelect: (algorithm: Algorithm) => void
}

const algorithms: Array<{
  id: Algorithm
  code: string
  name: string
  type: string
  description: string
}> = [
  {
    id: 'fcfs',
    code: '01',
    name: 'First come, first served',
    type: 'Non-preemptive',
    description: 'Execute processes in the order they arrive in the ready queue.',
  },
  {
    id: 'sjf',
    code: '02',
    name: 'Shortest job first',
    type: 'Non-preemptive',
    description: 'Select the shortest available CPU burst whenever the CPU is free.',
  },
  {
    id: 'round-robin',
    code: '03',
    name: 'Round robin',
    type: 'Preemptive',
    description: 'Rotate ready processes through fixed time slices for fair CPU access.',
  },
]

export function AlgorithmCards({ onSelect }: AlgorithmCardsProps) {
  return (
    <div className="algorithm-grid">
      {algorithms.map((algorithm) => (
        <button
          className="algorithm-card"
          key={algorithm.id}
          type="button"
          onClick={() => onSelect(algorithm.id)}
        >
          <span className="algorithm-card__visual" aria-hidden="true">
            <AlgorithmIllustration algorithm={algorithm.id} />
          </span>
          <span className="algorithm-card__meta">
            <span className="algorithm-card__number">{algorithm.code}</span>
            <span className="algorithm-card__type">{algorithm.type}</span>
          </span>
          <span className="algorithm-card__name">{algorithm.name}</span>
          <span className="algorithm-card__description">{algorithm.description}</span>
          <span className="algorithm-card__action">Configure simulation <b>→</b></span>
        </button>
      ))}
    </div>
  )
}
