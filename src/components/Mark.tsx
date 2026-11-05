type MarkProps = {
  size?: 'small' | 'large'
}

export function Mark({ size = 'small' }: MarkProps) {
  return (
    <span className={`mark mark--${size}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  )
}
