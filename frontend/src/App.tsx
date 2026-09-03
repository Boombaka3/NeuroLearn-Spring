import { useEffect, useState, type FormEvent } from 'react'
import { ApiClientError } from './api/client'
import { getParticipantAssessments, submitPostAssessment, submitPreAssessment } from './api/assessments'
import { submitQuiz } from './api/quiz'
import { getCompletion } from './api/completion'
import { requestCertificate } from './api/certificates'
import { AssessmentForm } from './components/AssessmentForm'
import { ErrorNotice } from './components/ErrorNotice'
import { Progress } from './components/Progress'
import type { AssessmentAnswers, CompletionStatusResponse, QuizSubmissionResponse } from './types/api'

type Stage = 'welcome' | 'pre' | 'course' | 'quiz' | 'post' | 'completion'

const stageNumbers: Record<Stage, number> = {
  welcome: 0, pre: 1, course: 2, quiz: 3, post: 4, completion: 5,
}

const quizQuestions = [
  { id: 'q1', prompt: 'How does a biological neuron primarily communicate information?', options: ['By changing its physical size', 'Through electrical and chemical signals', 'By storing complete memories alone', 'Through binary source code'] },
  { id: 'q2', prompt: 'What determines an artificial neuron’s output?', options: ['Weighted inputs passed through an activation function', 'Its physical location in a computer', 'A single fixed input', 'The size of the training file only'] },
  { id: 'q3', prompt: 'What usually changes as a neural network trains?', options: ['The question labels', 'The processor brand', 'The connection weights', 'The programming language'] },
  { id: 'q4', prompt: 'What is one useful similarity between brains and artificial neural networks?', options: ['They are identical systems', 'Both require conscious thought', 'Both use biological cells', 'Connections can adapt in response to experience or data'] },
  { id: 'q5', prompt: 'What process helps a neural network improve from examples?', options: ['Randomly deleting every input', 'Optimization that reduces prediction error', 'Keeping every weight unchanged', 'Replacing the dataset after each answer'] },
] as const

const participantPattern = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/

function displayError(error: unknown): string {
  if (error instanceof ApiClientError) {
    const details = Object.values(error.fieldErrors)
    return details.length ? `${error.message}: ${details.join('; ')}` : error.message
  }
  return 'Something unexpected happened. Please try again.'
}

export function App() {
  const [participantCode, setParticipantCode] = useState(() => sessionStorage.getItem('neurolearn.participantCode') || '')
  const [stage, setStage] = useState<Stage>('welcome')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizResult, setQuizResult] = useState<QuizSubmissionResponse | null>(null)
  const [completion, setCompletion] = useState<CompletionStatusResponse | null>(null)
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    if (participantCode) sessionStorage.setItem('neurolearn.participantCode', participantCode)
  }, [participantCode])

  const moveTo = (next: Stage) => {
    setError(null)
    setStage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const beginOrResume = async (event: FormEvent) => {
    event.preventDefault()
    const code = participantCode.trim().toUpperCase()
    if (code.length < 6 || code.length > 32 || !participantPattern.test(code)) {
      setError('Use 6–32 letters or numbers, with single hyphens only.')
      return
    }
    setBusy(true)
    setError(null)
    setParticipantCode(code)
    try {
      await getParticipantAssessments(code)
      const status = await getCompletion(code)
      setCompletion(status)
      if (status.complete) moveTo('completion')
      else if (!status.preAssessmentSubmitted) moveTo('pre')
      else if (!status.quizSubmitted) moveTo('course')
      else if (!status.postAssessmentSubmitted) moveTo('post')
      else moveTo('completion')
    } catch (requestError) {
      if (requestError instanceof ApiClientError && requestError.status === 404) moveTo('pre')
      else setError(displayError(requestError))
    } finally {
      setBusy(false)
    }
  }

  const submitAssessment = async (kind: 'pre' | 'post', answers: AssessmentAnswers) => {
    setBusy(true)
    setError(null)
    try {
      const request = { participantCode, answers }
      if (kind === 'pre') {
        await submitPreAssessment(request)
        moveTo('course')
      } else {
        await submitPostAssessment(request)
        const status = await getCompletion(participantCode)
        setCompletion(status)
        moveTo('completion')
      }
    } catch (requestError) {
      setError(displayError(requestError))
    } finally {
      setBusy(false)
    }
  }

  const submitQuizAnswers = async (event: FormEvent) => {
    event.preventDefault()
    if (Object.keys(quizAnswers).length !== quizQuestions.length) {
      setError('Answer all five questions before submitting.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      setQuizResult(await submitQuiz({ participantCode, answers: quizAnswers }))
    } catch (requestError) {
      setError(displayError(requestError))
    } finally {
      setBusy(false)
    }
  }

  const downloadCertificate = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const { blob, filename } = await requestCertificate({ participantCode, displayName: displayName.trim() })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(displayError(requestError))
    } finally {
      setBusy(false)
    }
  }

  const startAnother = () => {
    sessionStorage.removeItem('neurolearn.participantCode')
    setParticipantCode('')
    setQuizAnswers({})
    setQuizResult(null)
    setCompletion(null)
    setDisplayName('')
    moveTo('welcome')
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="NeuroLearn home"><span className="brand-mark">N</span>NeuroLearn</a>
        <span className="course-label">Brain × AI 101</span>
      </header>

      <main id="top">
        <Progress current={stageNumbers[stage]} />
        <ErrorNotice message={error} />

        {stage === 'welcome' && (
          <section className="hero panel">
            <div>
              <p className="eyebrow">A short interactive course</p>
              <h1>Discover how brains inspired modern AI.</h1>
              <p className="lede">Reflect on what you know, explore the core ideas, and test your understanding. Your participant code connects your progress without collecting your name.</p>
              <div className="course-facts"><span>20 minutes</span><span>5-question quiz</span><span>PDF certificate</span></div>
            </div>
            <form className="code-card" onSubmit={beginOrResume}>
              <label htmlFor="participant-code">Participant code</label>
              <input id="participant-code" value={participantCode} onChange={(event) => setParticipantCode(event.target.value)} placeholder="e.g. BRAIN-101" autoComplete="off" maxLength={32} />
              <small>6–32 letters or numbers; single hyphens are allowed.</small>
              <button className="primary" disabled={busy}>{busy ? 'Checking…' : 'Begin or resume'}</button>
            </form>
          </section>
        )}

        {stage === 'pre' && (
          <AssessmentForm title="Before you begin" description="Rate your current confidence. There are no right answers, and these responses do not affect your quiz score." submitLabel="Save and start course" busy={busy} onSubmit={(answers) => submitAssessment('pre', answers)} />
        )}

        {stage === 'course' && (
          <section className="panel lesson">
            <p className="eyebrow">Course notes</p>
            <h2>From neurons to networks</h2>
            <p className="lede">Artificial neural networks borrow a useful idea from the brain: complex behavior can emerge from many simple units connected together.</p>
            <div className="lesson-grid">
              <article><span>01</span><h3>Signals</h3><p>Biological neurons communicate through electrical impulses and chemical messengers. Artificial neurons receive numbers and produce a calculated output.</p></article>
              <article><span>02</span><h3>Connections</h3><p>Synapses influence how strongly neurons affect one another. In an AI model, numeric weights control the influence of each input.</p></article>
              <article><span>03</span><h3>Learning</h3><p>Experience can strengthen or weaken biological connections. Training adjusts an AI network’s weights to reduce prediction error across examples.</p></article>
            </div>
            <aside className="boundary-note"><strong>Important distinction</strong><p>A neural network is a mathematical model inspired by selected ideas from neuroscience. It is not a digital brain and does not establish human-like understanding.</p></aside>
            <button className="primary" onClick={() => moveTo('quiz')}>Take the quiz</button>
          </section>
        )}

        {stage === 'quiz' && !quizResult && (
          <form className="panel" onSubmit={submitQuizAnswers}>
            <p className="eyebrow">Knowledge check</p>
            <h2>Five quick questions</h2>
            <p className="lede">Your answers go to the NeuroLearn server, where the trusted score is calculated and stored.</p>
            <div className="quiz-list">
              {quizQuestions.map((question, questionIndex) => (
                <fieldset className="quiz-question" key={question.id}>
                  <legend><span>{questionIndex + 1}</span>{question.prompt}</legend>
                  {question.options.map((option, optionIndex) => {
                    const value = String.fromCharCode(65 + optionIndex)
                    return <label key={value}><input type="radio" name={question.id} value={value} checked={quizAnswers[question.id] === value} onChange={() => setQuizAnswers((current) => ({ ...current, [question.id]: value }))} /><span><b>{value}</b>{option}</span></label>
                  })}
                </fieldset>
              ))}
            </div>
            <button className="primary" disabled={busy}>{busy ? 'Scoring on server…' : 'Submit answers'}</button>
          </form>
        )}

        {stage === 'quiz' && quizResult && (
          <section className="panel result-card">
            <p className="eyebrow">Server-calculated result</p>
            <div className="score-ring"><strong>{Math.round(quizResult.percentage)}%</strong><span>{quizResult.score} of {quizResult.total}</span></div>
            <h2>Quiz complete</h2>
            <p>Your result has been saved. Finish with one more reflection.</p>
            <button className="primary" onClick={() => moveTo('post')}>Continue to final reflection</button>
          </section>
        )}

        {stage === 'post' && (
          <AssessmentForm title="After the course" description="Rate your confidence now. NeuroLearn will verify completion after this response is stored." submitLabel="Complete course" busy={busy} onSubmit={(answers) => submitAssessment('post', answers)} />
        )}

        {stage === 'completion' && completion && (
          <section className="panel completion-card">
            <div className="completion-badge">✓</div>
            <p className="eyebrow">Verified by NeuroLearn</p>
            <h1>{completion.complete ? 'Course complete!' : 'Completion pending'}</h1>
            <p className="lede">Participant <strong>{completion.participantCode}</strong> has {completion.complete ? 'completed every required step.' : 'not yet completed every required step.'}</p>
            <div className="status-grid">
              <span className={completion.preAssessmentSubmitted ? 'done' : ''}>Pre-assessment</span>
              <span className={completion.quizSubmitted ? 'done' : ''}>Quiz {completion.quizScore !== null && `(${completion.quizScore}/${completion.quizTotal})`}</span>
              <span className={completion.postAssessmentSubmitted ? 'done' : ''}>Post-assessment</span>
            </div>
            {completion.complete && (
              <form className="certificate-form" onSubmit={downloadCertificate}>
                <label htmlFor="display-name">Name for your certificate</label>
                <div><input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your display name" minLength={2} maxLength={64} required /><button className="primary" disabled={busy}>{busy ? 'Generating…' : 'Download PDF'}</button></div>
                <small>Your name is used only to generate this download and is not stored.</small>
              </form>
            )}
            <button className="text-button" onClick={startAnother}>Use another participant code</button>
          </section>
        )}
      </main>

      <footer><span>NeuroLearn</span><span>Course: Brain × AI 101</span></footer>
    </div>
  )
}
