import { useState } from 'react'
import { useT } from '../../i18n/useT'
import './moduleNav.css'

export default function ModuleNav({ current, sections = [], activeIndex = 0, visitedIndices = new Set(), onSectionClick, onBack, onCourseStepClick }) {
  const t = useT()
  const moduleConfig = {
    module1: { num: '01', label: t('nav.module1.label'), fullTitle: t('nav.module1.title'), color: '#2563eb', time: t('nav.module1.time') },
    module2: { num: '02', label: t('nav.module2.label'), fullTitle: t('nav.module2.title'), color: '#7c3aed', time: t('nav.module2.time') },
    module3: { num: '03', label: t('nav.module3.label'), fullTitle: t('nav.module3.title'), color: '#059669', time: t('nav.module3.time') },
  }
  const courseSteps = [
    { key: 'module1', short: '01', label: t('nav.path.module1') },
    { key: 'module2', short: '02', label: t('nav.path.module2') },
    { key: 'module3', short: '03', label: t('nav.path.module3') },
    { key: 'courseEvaluation', short: 'EV', label: t('nav.path.evaluation') },
    { key: 'completion', short: 'OK', label: t('nav.path.completion') },
  ]
  const mod = moduleConfig[current]
  const [mobileOpen, setMobileOpen] = useState(false)

  const completedCount = [...visitedIndices].filter(i => i !== activeIndex).length
  const totalSections = sections.length
  const progress = totalSections > 0 ? (completedCount + 1) / totalSections : 0
  const currentCourseStep = courseSteps.findIndex(step => step.key === current)

  return (
    <>
      {/* Mobile top bar */}
      <nav className="mnav-mobile">
        <button className="mnav-mobile-back" onClick={onBack} aria-label={t('nav.backToHome')}>
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="mnav-mobile-info">
          <span className="mnav-mobile-module" style={{ color: mod.color }}>{mod.fullTitle}</span>
          <div className="mnav-mobile-dots">
            {sections.map((_, i) => (
              <span
                key={i}
                className={`mnav-mobile-dot${i === activeIndex ? ' active' : ''}${visitedIndices.has(i) && i !== activeIndex ? ' visited' : ''}`}
                style={i === activeIndex ? { background: mod.color } : undefined}
              />
            ))}
          </div>
        </div>
        <button className="mnav-mobile-toggle" onClick={() => setMobileOpen(v => !v)} aria-label={t('nav.toggleSections')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="mnav-mobile-dropdown">
          {sections.map((s, i) => {
            const isActive = i === activeIndex
            const isVisited = visitedIndices.has(i) && !isActive
            return (
              <button
                key={i}
                className={`mnav-mobile-item${isActive ? ' active' : ''}`}
                style={isActive ? { color: mod.color } : undefined}
                onClick={() => { onSectionClick?.(i); setMobileOpen(false) }}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="mnav-mobile-item-icon">
                  {isVisited ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1.5" />
                      <path d="M4.5 7l1.8 1.8 3.2-3.6" stroke="#16A34A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className={`mnav-mobile-item-dot${isActive ? ' active' : ''}`} style={isActive ? { background: mod.color, borderColor: mod.color } : undefined} />
                  )}
                </span>
                <span>{s.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Desktop sidebar */}
      <nav className="mnav-sidebar" style={{ '--mnav-accent': mod.color }}>
        <div className="mnav-sidebar-inner">
          {/* Back */}
          <button className="mnav-back" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t('nav.home')}</span>
          </button>
          <button
            type="button"
            className="mnav-pre-link"
            onClick={() => onCourseStepClick?.('preCourseEvaluation')}
          >
            <span className="mnav-pre-link-kicker">{t('nav.optional')}</span>
            <span className="mnav-pre-link-title">{t('nav.preCourseEvaluation')}</span>
          </button>

          {/* Course path */}
          <div className="mnav-course-path" aria-label={t('nav.coursePath')}>
            {courseSteps.map((step, index) => {
              const isCurrent = index === currentCourseStep
              const isComplete = currentCourseStep > index
              const accentStyle = isCurrent && mod ? { background: mod.color, borderColor: mod.color, color: '#fff' } : undefined

              return (
                <div key={step.key} className="mnav-course-step">
                  <button
                    type="button"
                    className={`mnav-module-pip${isCurrent ? ' active' : ''}${isComplete ? ' complete' : ''}`}
                    style={accentStyle}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={step.label}
                    title={step.label}
                    onClick={() => onCourseStepClick?.(step.key)}
                  >
                    <span>{step.short}</span>
                  </button>
                  {index < courseSteps.length - 1 && (
                    <div className={`mnav-course-line${isCurrent || isComplete ? ' filled' : ''}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Module title */}
          <div className="mnav-module-header">
            <span className="mnav-module-num">{t('nav.modulePrefix')} {mod.num}</span>
            <h2 className="mnav-module-title">{mod.fullTitle}</h2>
            <span className="mnav-module-time">{mod.time}</span>
          </div>

          <div className="mnav-divider" />

          {/* Section list */}
          <div className="mnav-section-list">
            {sections.map((s, i) => {
              const isActive = i === activeIndex
              const isVisited = visitedIndices.has(i) && !isActive
              return (
                <button
                  key={i}
                  className={`mnav-section-item${isActive ? ' active' : ''}${isVisited ? ' visited' : ''}`}
                  onClick={() => onSectionClick?.(i)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="mnav-section-track">
                    {isVisited ? (
                      <svg className="mnav-section-check" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="8" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1.5" />
                        <path d="M5.5 9l2.2 2.2 4-4.4" stroke="#16A34A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <div className={`mnav-section-dot${isActive ? ' active' : ''}`} />
                    )}
                    {i < sections.length - 1 && <div className={`mnav-section-line${isVisited || isActive ? ' filled' : ''}`} />}
                  </div>
                  <span className="mnav-section-label">{s.label}</span>
                </button>
              )
            })}
          </div>

          {/* Progress */}
          <div className="mnav-progress">
            <div className="mnav-progress-text">
              <span>{t('nav.progress', { current: Math.min(completedCount + 1, totalSections), total: totalSections })}</span>
            </div>
            <div className="mnav-progress-bar">
              <div className="mnav-progress-fill" style={{ width: `${Math.min(100, progress * 100)}%` }} />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
