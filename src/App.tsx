import { useState } from 'react'
import { AlgorithmCards } from './components/AlgorithmCards'
import { Mark } from './components/Mark'
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
          <div className="signal-rail" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="landing-copy">
            <p className="eyebrow">Interactive CPU scheduling simulator</p>
            <h1>See every decision the scheduler makes.</h1>
            <p className="landing-copy__body">
              Configure a ready queue, run a scheduling policy, and inspect its execution timeline and performance metrics.
            </p>
            <button className="button button--primary button--start" type="button" onClick={() => setScreen('algorithm-selection')}>
              Start simulation <span>→</span>
            </button>
          </div>
          <div className="landing-diagram" aria-label="CPU scheduler flow diagram">
            <div className="diagram-node diagram-node--queue"><span>Ready queue</span><b>P1 · P2 · P3</b></div>
            <div className="diagram-line" />
            <div className="diagram-node diagram-node--cpu"><Mark size="large" /><span>CPU</span></div>
            <div className="diagram-line diagram-line--out" />
            <div className="diagram-node diagram-node--output"><span>Output</span><b>Timeline + metrics</b></div>
          </div>
        </main>
      ) : (
        <main className="selection-content">
          <button className="back-link" type="button" onClick={() => setScreen('landing')}>← Back to overview</button>
          <p className="eyebrow">Step 1 of 2</p>
          <h1>Choose a scheduling policy.</h1>
          <p className="selection-intro">Each policy uses the same process input, but makes a different decision about which process receives the CPU next.</p>
          <AlgorithmCards onSelect={selectAlgorithm} />
        </main>
      )}
    </div>
  )
}

export default App
