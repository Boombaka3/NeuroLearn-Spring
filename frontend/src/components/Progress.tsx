const steps = ['Welcome', 'Pre', 'Course', 'Quiz', 'Post', 'Complete'] as const

interface ProgressProps {
  current: number
}

export function Progress({ current }: ProgressProps) {
  return (
    <ol className="progress" aria-label="Course progress">
      {steps.map((step, index) => (
        <li key={step} className={index <= current ? 'active' : ''} aria-current={index === current ? 'step' : undefined}>
          <span>{index + 1}</span>{step}
        </li>
      ))}
    </ol>
  )
}
