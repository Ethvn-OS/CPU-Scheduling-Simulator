import type { Algorithm } from '../types/scheduling'

type AlgorithmIllustrationProps = {
  algorithm: Algorithm
}

export function AlgorithmIllustration({ algorithm }: AlgorithmIllustrationProps) {
  return (
    <svg
      className="algorithm-illustration"
      viewBox="0 0 240 140"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {algorithm === 'fcfs' ? (
        <g>
          <path d="M22 70h30m-9-9 9 9-9 9M188 70h30" />
          <rect className="algorithm-illustration__surface" x="62" y="48" width="116" height="44" rx="3" />
          <rect x="62" y="48" width="39" height="44" rx="3" fill="#e8662e" fillOpacity=".12" stroke="#e8662e" />
          <path d="M101 48v44m38-44v44" />
          <circle cx="82" cy="70" r="3" fill="#e8662e" stroke="none" />
          <circle cx="120" cy="70" r="3" fill="currentColor" stroke="none" />
          <circle cx="158" cy="70" r="3" fill="currentColor" stroke="none" />
        </g>
      ) : algorithm === 'sjf' ? (
        <g>
          <path d="M42 34h12m-5-5 5 5-5 5" stroke="#e8662e" />
          <rect x="66" y="28" width="42" height="12" rx="2" fill="#e8662e" stroke="none" />
          <rect x="66" y="52" width="66" height="12" rx="2" fill="currentColor" stroke="none" opacity=".35" />
          <rect x="66" y="76" width="94" height="12" rx="2" fill="currentColor" stroke="none" opacity=".6" />
          <rect x="66" y="100" width="124" height="12" rx="2" fill="currentColor" stroke="none" />
        </g>
      ) : (
        <g>
          <path d="M82 45a46 46 0 0 1 81 3m-13-4 13 4-2-14" />
          <path d="M158 95a46 46 0 0 1-81-3m12 4-12-4 2 14" stroke="#e8662e" />
          <circle cx="94" cy="70" r="4" fill="currentColor" stroke="none" />
          <circle cx="120" cy="70" r="6" fill="#e8662e" stroke="none" />
          <circle cx="146" cy="70" r="4" fill="currentColor" stroke="none" />
        </g>
      )}
    </svg>
  )
}
