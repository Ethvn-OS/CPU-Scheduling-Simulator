import { useState } from 'react'
import { AlgorithmCards } from './components/AlgorithmCards'
import { SimulationPreview } from './components/SimulationPreview'
import { Topbar } from './components/Topbar'
import { Workspace } from './components/Workspace'
import type { Algorithm, AppScreen } from './types/scheduling'
import './index.css'

function App() {
  const [screen, setScreen] = useState<AppScreen>('landing')
  const [algorithm, setAlgorithm] = useState<Algorithm>('fcfs')

  const selectAlgorithm = (nextAlgorithm: Algorithm) => {
    setAlgorithm(nextAlgorithm)
    setScreen('workspace')
  }

  return (
    <div className={screen === 'landing' ? 'landing-shell' : screen === 'algorithm-selection' ? 'selection-shell' : 'workspace-page'}>
      <Topbar onHome={() => setScreen('landing')} />

      {screen === 'workspace' ? (
        <Workspace algorithm={algorithm} onChangeAlgorithm={() => setScreen('algorithm-selection')} />
      ) : screen === 'landing' ? (
        <main className="landing-content">
          <SimulationPreview />
          <div className="landing-copy">
            <h1>CPU Scheduling Simulator</h1>
            <p className="landing-copy__body">
              Configure a ready queue, run a scheduling policy, and inspect its execution timeline and performance metrics.
            </p>
            <p className="landing-algorithms">FCFS · SJF · Round Robin</p>
            <button className="button button--primary button--start" type="button" onClick={() => setScreen('algorithm-selection')}>
              Start simulation <span>→</span>
            </button>
          </div>
        </main>
      ) : (
        <main className="selection-content">
          <button className="back-link" type="button" onClick={() => setScreen('landing')}>← Back to overview</button>
          <h1>Select a CPU Scheduling Algorithm</h1>
          <p className="selection-intro">Choose an algorithm to explore and see how it schedules processes</p>
          <AlgorithmCards onSelect={selectAlgorithm} />
        </main>
      )}
    </div>
  )
}

export default App
