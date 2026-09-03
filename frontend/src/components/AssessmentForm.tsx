import { useState, type FormEvent } from 'react'
import type { AssessmentAnswers } from '../types/api'

const prompts: Array<{ key: keyof AssessmentAnswers; label: string }> = [
  { key: 'aiFamiliarity', label: 'I am familiar with artificial intelligence concepts.' },
  { key: 'neuronUnderstanding', label: 'I understand how biological neurons pass signals.' },
  { key: 'aiUnderstanding', label: 'I can explain how neural networks learn from examples.' },
]

interface AssessmentFormProps {
  title: string
  description: string
  submitLabel: string
  busy: boolean
  onSubmit: (answers: AssessmentAnswers) => Promise<void>
}

export function AssessmentForm({ title, description, submitLabel, busy, onSubmit }: AssessmentFormProps) {
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    aiFamiliarity: 3,
    neuronUnderstanding: 3,
    aiUnderstanding: 3,
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onSubmit(answers)
  }

  return (
    <form className="panel" onSubmit={submit}>
      <p className="eyebrow">Quick reflection</p>
      <h2>{title}</h2>
      <p className="lede">{description}</p>
      <div className="likert-legend"><span>1 · Not yet</span><span>5 · Confident</span></div>
      {prompts.map(({ key, label }) => (
        <fieldset className="likert" key={key}>
          <legend>{label}</legend>
          <div>
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value}>
                <input
                  type="radio"
                  name={key}
                  value={value}
                  checked={answers[key] === value}
                  onChange={() => setAnswers((current) => ({ ...current, [key]: value }))}
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button className="primary" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
    </form>
  )
}
