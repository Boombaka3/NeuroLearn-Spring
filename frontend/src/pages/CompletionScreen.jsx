import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { generateCertificateDocument } from '../lib/api/certificate'
import { getCompletion } from '../lib/api/completion'
import { getOrCreateSessionId } from '../modules/CourseEvaluation/lib/courseEvaluationStorage'
import { useT } from '../i18n/useT'
import { selectCourseCompletionStatus } from '../lib/courseCompletion'
import { useAppSelector } from '../store/hooks'
import '../styles/shared.css'
import './completionScreen.css'

const MODULES = [
  { num: '01', titleKey: 'completion.module1.title', summaryKey: 'completion.module1.summary', color: '#2563eb', key: 'module1' },
  { num: '02', titleKey: 'completion.module2.title', summaryKey: 'completion.module2.summary', color: '#7c3aed', key: 'module2' },
  { num: '03', titleKey: 'completion.module3.title', summaryKey: 'completion.module3.summary', color: '#059669', key: 'module3' },
]

const NEXT_STEPS = [
  { icon: '🧠', titleKey: 'completion.resource.1.title', descKey: 'completion.resource.1.desc', url: 'https://www.3blue1brown.com/topics/neural-networks' },
  { icon: '📘', titleKey: 'completion.resource.2.title', descKey: 'completion.resource.2.desc', url: 'http://neuralnetworksanddeeplearning.com/' },
  { icon: '🎮', titleKey: 'completion.resource.3.title', descKey: 'completion.resource.3.desc', url: 'https://playground.tensorflow.org/' },
  { icon: '🔬', titleKey: 'completion.resource.4.title', descKey: 'completion.resource.4.desc', url: 'https://distill.pub/' },
]

function sanitizeName(value) {
  return value.trim().replace(/\s+/g, ' ')
}

function CompletionScreen({ onGoToModule, onBackToHome }) {
  const t = useT()
  const completionStatus = useAppSelector(selectCourseCompletionStatus)
  const heroRef = useRef(null)
  const cardsRef = useRef(null)
  const nextRef = useRef(null)
  const [studentName, setStudentName] = useState('')
  const [nameError, setNameError] = useState('')
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false)
  const [serverCompletion, setServerCompletion] = useState(null)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    let active = true
    getCompletion(getOrCreateSessionId())
      .then((status) => {
        if (active) setServerCompletion(status)
      })
      .catch((error) => {
        if (active) setServerError(error instanceof Error ? error.message : 'Unable to verify course completion.')
      })
    return () => {
      active = false
    }
  }, [])

  const certificateUnlocked = completionStatus.isUnlocked && serverCompletion?.complete === true

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cardNodes = cardsRef.current ? Array.from(cardsRef.current.children) : []
      const animatedNodes = [heroRef.current, ...cardNodes, nextRef.current].filter(Boolean)

      gsap.set(animatedNodes, { opacity: 1, y: 0, clearProps: 'transform' })

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          gsap.set(animatedNodes, { clearProps: 'opacity,transform' })
        },
      })

      tl.from(heroRef.current, { y: 18, duration: 0.45 })
      tl.from(cardNodes, { y: 14, duration: 0.32, stagger: 0.1 }, '-=0.14')
      tl.from(nextRef.current, { y: 14, duration: 0.36 }, '-=0.08')
    })

    return () => ctx.revert()
  }, [])

  const handleCertificateNameChange = (event) => {
    setStudentName(event.target.value)
    if (nameError) {
      setNameError('')
    }
  }

  const handleGenerateCertificate = async () => {
    if (!certificateUnlocked) {
      setNameError(t('completion.error.unlock'))
      return
    }

    const normalizedName = sanitizeName(studentName)

    if (!normalizedName) {
      setNameError(t('completion.error.enterName'))
      return
    }

    setNameError('')
    setIsGeneratingCertificate(true)

    try {
      const { blob, filename } = await generateCertificateDocument(normalizedName)
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(objectUrl)
      setStudentName(normalizedName)
    } catch (error) {
      console.error('Certificate generation failed', error)
      setNameError(error instanceof Error ? error.message : t('completion.error.generate'))
    } finally {
      setIsGeneratingCertificate(false)
    }
  }

  return (
    <div className="completion-page">
      <div className="completion-content">
        <div ref={heroRef} className="completion-hero">
          <div className="completion-badge">{t('completion.badge')}</div>
          <h1 className="completion-headline">{t('completion.title')}</h1>
          <p className="completion-subtitle">{t('completion.subtitle')}</p>
        </div>

        <section className="completion-recap">
          <h2 className="completion-section-title">{t('completion.learned')}</h2>
          <div ref={cardsRef} className="completion-module-cards">
            {MODULES.map((mod) => (
              <button
                key={mod.key}
                className="completion-module-card"
                style={{ '--card-accent': mod.color }}
                onClick={() => onGoToModule?.(mod.key)}
              >
                <span className="completion-module-num">{mod.num}</span>
                <h3 className="completion-module-title">{t(mod.titleKey)}</h3>
                <p className="completion-module-summary">{t(mod.summaryKey)}</p>
                <span className="completion-module-revisit">{t('completion.revisit')}</span>
              </button>
            ))}
          </div>
        </section>

        <section ref={nextRef} className="completion-next">
          <h2 className="completion-section-title">{t('completion.next')}</h2>
          <p className="completion-next-intro">{t('completion.nextIntro')}</p>
          <div className="completion-next-grid">
            {NEXT_STEPS.map((step, i) => (
              <a
                key={i}
                className="completion-next-card"
                href={step.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="completion-next-icon">{step.icon}</span>
                <h3 className="completion-next-title">{t(step.titleKey)}</h3>
                <p className="completion-next-desc">{t(step.descKey)}</p>
                <span className="completion-next-link">
                  {t('completion.visit')}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="completion-certificate">
          <h2 className="completion-section-title">{t('completion.certificate')}</h2>
          <p className="completion-certificate-intro">
            {certificateUnlocked ? t('completion.certificateUnlockedIntro') : t('completion.certificateLockedIntro')}
          </p>

          <div className="completion-certificate-shell">
            <div className="completion-certificate-status">
              <div className="completion-certificate-status-header">
                <div>
                  <p className="completion-certificate-status-label">{t('completion.progressLabel')}</p>
                  <h3 className="completion-certificate-status-title">
                    {t('completion.progressTitle', { completed: completionStatus.completedCount, total: completionStatus.totalCount })}
                  </h3>
                </div>
                <span
                  className={`completion-certificate-status-badge ${
                    certificateUnlocked
                      ? 'completion-certificate-status-badge--unlocked'
                      : 'completion-certificate-status-badge--locked'
                  }`}
                >
                  {certificateUnlocked ? t('completion.unlocked') : t('completion.locked')}
                </span>
              </div>

              {completionStatus.missingItems.length > 0 ? (
                <div className="completion-certificate-status-list">
                  <p className="completion-certificate-status-note">{t('completion.finishRemaining')}</p>
                  <ul className="completion-certificate-checklist">
                    {completionStatus.items.map((item) => (
                      <li
                        key={item.id}
                        className={`completion-certificate-checklist-item ${
                          item.completed
                            ? 'completion-certificate-checklist-item--done'
                            : 'completion-certificate-checklist-item--pending'
                        }`}
                      >
                        <span className="completion-certificate-checklist-mark" aria-hidden="true">
                          {item.completed ? '✓' : '•'}
                        </span>
                        <span>
                          <strong>{item.label}</strong>
                          {!item.completed ? ` — ${item.detail}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="completion-certificate-status-note">{t('completion.ready')}</p>
              )}
              {serverError ? <p className="completion-certificate-error" role="alert">{serverError}</p> : null}
              {!serverError && serverCompletion && !serverCompletion.complete ? (
                <p className="completion-certificate-status-note">
                  Server verification still requires a completed pre-course evaluation, quiz, and post-course evaluation.
                </p>
              ) : null}
            </div>

            {certificateUnlocked ? (
              <div className="completion-certificate-controls">
                <label className="completion-certificate-field">
                  <span>{t('completion.nameLabel')}</span>
                  <input
                    type="text"
                    value={studentName}
                    onChange={handleCertificateNameChange}
                    placeholder={t('completion.namePlaceholder')}
                    autoComplete="name"
                  />
                </label>
                <p className="completion-certificate-note">{t('completion.nameStored')}</p>
                <p className="completion-certificate-note">{t('completion.templateNote')}</p>
                {nameError ? (
                  <p className="completion-certificate-error" role="alert">{nameError}</p>
                ) : null}
                <div className="completion-certificate-actions">
                  <button
                    type="button"
                    className="shared-btn shared-btn-primary"
                    onClick={handleGenerateCertificate}
                    disabled={isGeneratingCertificate}
                  >
                    {isGeneratingCertificate ? t('completion.generating') : t('completion.download')}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <div className="completion-footer">
          <button className="completion-home-btn" onClick={onBackToHome}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l6-6 6 6M4 6.5V13h3v-3h2v3h3V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('completion.backHome')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompletionScreen
