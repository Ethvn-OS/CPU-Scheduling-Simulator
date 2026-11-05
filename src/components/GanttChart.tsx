import type { TimelineSegment } from '../types/scheduling'

type GanttChartProps = {
  timeline: TimelineSegment[]
}

const colors = ['#496e69', '#bd774e', '#747057', '#6a6481', '#a35d64', '#3f6b8a']

export function GanttChart({ timeline }: GanttChartProps) {
  const processColors = new Map<string, string>()
  let colorIndex = 0

  for (const segment of timeline) {
    if (segment.processId !== null && !processColors.has(segment.processId)) {
      processColors.set(segment.processId, colors[colorIndex % colors.length])
      colorIndex += 1
    }
  }

  const endTime = timeline[timeline.length - 1]?.endTime ?? 0

  return (
    <figure className="gantt-chart" aria-label="CPU execution timeline">
      <div className="gantt-scroll">
        <div className="gantt-track" style={{ minWidth: `${Math.max(100, endTime * 46)}px` }}>
          {timeline.map((segment, index) => {
            const duration = segment.endTime - segment.startTime
            const label = segment.processId ?? 'Idle'
            const background = segment.processId === null
              ? 'repeating-linear-gradient(135deg, #d7d7cf 0 6px, #edede6 6px 12px)'
              : processColors.get(segment.processId)

            return (
              <div
                className={`gantt-segment${segment.processId === null ? ' gantt-segment--idle' : ''}`}
                key={`${label}-${segment.startTime}-${index}`}
                style={{ flex: duration, background }}
                title={`${label}: ${segment.startTime} to ${segment.endTime} (${duration} unit${duration === 1 ? '' : 's'})`}
              >
                <span>{label}</span>
                {segment.reason === 'quantum-expired' && <small>slice</small>}
              </div>
            )
          })}
        </div>
        <div className="gantt-times" style={{ minWidth: `${Math.max(100, endTime * 46)}px` }}>
          {timeline.map((segment, index) => (
            <span key={`${segment.startTime}-${index}`} style={{ flex: segment.endTime - segment.startTime }}>{segment.startTime}</span>
          ))}
          <span className="gantt-times__end">{endTime}</span>
        </div>
      </div>
      <figcaption>Each block shows one uninterrupted CPU interval. Striped blocks represent CPU idle time.</figcaption>
    </figure>
  )
}
