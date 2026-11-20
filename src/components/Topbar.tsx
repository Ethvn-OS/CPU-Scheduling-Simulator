import { Mark } from './Mark'

type TopbarProps = {
  onHome: () => void
}

export function Topbar({ onHome }: TopbarProps) {
  return (
    <nav className="topbar" aria-label="Main navigation">
      <button className="brand" type="button" onClick={onHome}>
        <Mark />
        <span>CPU scheduling lab</span>
      </button>
      <span className="topbar__meta">Operating systems · Final project</span>
    </nav>
  )
}
