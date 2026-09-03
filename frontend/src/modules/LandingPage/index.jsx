import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useT } from '../../i18n/useT'
import '../../styles/shared.css'
import './landing.css'

gsap.registerPlugin(ScrollTrigger)

const NeuronShowcase = lazy(() => import('../../components/three/NeuronShowcase'))

const NOISE_PATTERN = [
  0.2, 0.8, 0.1, 0.7, 0.3,
  0.6, 0.2, 0.9, 0.1, 0.5,
  0.1, 0.7, 0.3, 0.8, 0.2,
  0.9, 0.3, 0.6, 0.2, 0.7,
  0.2, 0.5, 0.1, 0.9, 0.3,
]

const EDGE_PATTERN = [
  0.05, 0.05, 0.9, 0.05, 0.05,
  0.05, 0.05, 0.9, 0.05, 0.05,
  0.9, 0.9, 0.9, 0.9, 0.9,
  0.05, 0.05, 0.9, 0.05, 0.05,
  0.05, 0.05, 0.9, 0.05, 0.05,
]

function DotGrid({ resolved }) {
  const pattern = resolved ? EDGE_PATTERN : NOISE_PATTERN

  return (
    <div className="lp-dot-grid">
      {pattern.map((v, i) => (
        <div
          key={i}
          className={`lp-dot${v > 0.5 ? ' lp-dot--active' : ''}`}
          style={{
            background: v > 0.5
              ? `rgba(45,126,255,${0.4 + v * 0.5})`
              : `rgba(203,213,225,${0.3 + v * 0.4})`,
          }}
        />
      ))}
    </div>
  )
}

export default function LandingPage({ onStart, onNavigate }) {
  const t = useT()
  const modulesRef = useRef(null)
  const patternRef = useRef(null)
  const [dotResolved, setDotResolved] = useState(false)
  const anatomySteps = [
    { label: t('landing.narrative.module1.anatomy.step1'), color: 'blue' },
    { label: t('landing.narrative.module1.anatomy.step2'), color: 'green' },
    { label: t('landing.narrative.module1.anatomy.step3'), color: 'amber' },
    { label: t('landing.narrative.module1.anatomy.step4'), color: 'purple' },
  ]
  const courseModules = [
    { key: 'module1', mod: t('landing.bento.schedule.module1.mod'), label: t('landing.bento.schedule.module1.label'), time: t('landing.bento.schedule.module1.time'), color: '#2D7EFF' },
    { key: 'module2', mod: t('landing.bento.schedule.module2.mod'), label: t('landing.bento.schedule.module2.label'), time: t('landing.bento.schedule.module2.time'), color: '#7C3AED' },
    { key: 'module3', mod: t('landing.bento.schedule.module3.mod'), label: t('landing.bento.schedule.module3.label'), time: t('landing.bento.schedule.module3.time'), color: '#10B981' },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.lp-hero-bg-text', {
        opacity: 0,
        scale: 0.92,
        duration: 1.4,
        ease: 'power3.out',
        delay: 0.1,
      })

      gsap.from('.lp-flank-left, .lp-flank-right, .lp-hero-bottom, .lp-scroll-hint', {
        y: 40,
        opacity: 0,
        duration: 1.0,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.5,
      })

      gsap.from('.lp-bust', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.2,
      })

      gsap.from('.lp-bd-card', {
        scrollTrigger: { trigger: '.lp-bento-dash-grid', start: 'top 82%', once: true },
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
      })

      gsap.utils.toArray('.lp-nr-label, .lp-nr-heading, .lp-nr-body').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          y: 28,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
        })
      })

      ScrollTrigger.create({
        trigger: patternRef.current,
        start: 'top 72%',
        once: true,
        onEnter: () => setDotResolved(true),
      })

      gsap.from('.lp-final-heading, .lp-final-sub, .lp-final-actions', {
        scrollTrigger: { trigger: '.lp-final-cta', start: 'top 85%', once: true },
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
      })
    })

    return () => ctx.revert()
  }, [])

  const handleNavigate = (view) => {
    if (typeof onNavigate === 'function') {
      if (view === 'module1') {
        onStart?.()
        return
      }
      onNavigate(view)
      return
    }

    if (view === 'module1') {
      onStart?.()
    }
  }

  const scrollToModules = () => {
    modulesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="lp-page">
      <section className="lp-hero">
        <h1 className="lp-hero-bg-text" aria-hidden="true">
          Brain &times; AI 101
        </h1>

        <span className="lp-hero-tag lp-hero-tag--left">{t('landing.hero.tag.left')}</span>
        <span className="lp-hero-tag lp-hero-tag--right">{t('landing.hero.tag.right')}</span>

        <div className="lp-hero-center">
          <img
            src={import.meta.env.BASE_URL + 'images/bust.png'}
            alt={t('landing.hero.image.alt')}
            className="lp-bust"
          />
        </div>

        <div className="lp-flank-left">
          <p className="lp-flank-label">
            {t('landing.hero.flank.label')}
          </p>
          <button className="lp-btn-text" onClick={scrollToModules}>
            {t('landing.hero.viewModules')} <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
          </button>
        </div>

        <div className="lp-flank-right">
          <span className="lp-flank-stat">86B</span>
          <p className="lp-flank-stat-label">{t('landing.hero.stat.label').split('\n')[0]}<br />{t('landing.hero.stat.label').split('\n')[1]}</p>
        </div>

        <div className="lp-hero-bottom">
          <div className="lp-hero-meta">
            <span className="lp-meta-chip">{t('landing.hero.meta.duration')}</span>
            <span className="lp-meta-chip">{t('landing.hero.meta.labs')}</span>
            <span className="lp-meta-chip">{t('landing.hero.meta.modules')}</span>
          </div>
          <button className="lp-btn-primary" onClick={onStart}>
            {t('landing.hero.start')} <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
          </button>
        </div>

        <div className="lp-scroll-hint">
          <span className="lp-scroll-line" />
          <span className="lp-scroll-text">{t('landing.hero.scroll')}</span>
        </div>

        <h1 className="sr-only">{t('landing.hero.srTitle')}</h1>
      </section>

      <section className="lp-bento-dash" ref={modulesRef}>
        <div className="lp-bento-dash-grid">
          <div className="lp-bd-left">
            <div className="lp-bd-card lp-bd-course-info">
              <p className="lp-bd-overline">{t('landing.bento.course.overline')}</p>
              <h2 className="lp-bd-headline">{t('landing.bento.course.headline.line1')}<br />{t('landing.bento.course.headline.line2')}</h2>
              <p className="lp-bd-sub">
                {t('landing.bento.course.sub')}
              </p>
              <button className="lp-btn-primary lp-btn-primary--sm" onClick={scrollToModules}>
                {t('landing.hero.viewModules')} <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
              </button>
            </div>

            <div className="lp-bd-card lp-bd-modules">
              <div className="lp-bd-mod-tabs">
                <button className="lp-bd-tab lp-bd-tab--active" onClick={() => handleNavigate('module1')}>
                  <span className="lp-bd-tab-dot lp-bd-tab-dot--blue" />
                  {t('landing.bento.modules.tab.neurons')}
                </button>
                <button className="lp-bd-tab" onClick={() => handleNavigate('module2')}>
                  <span className="lp-bd-tab-dot lp-bd-tab-dot--purple" />
                  {t('landing.bento.modules.tab.perception')}
                </button>
                <button className="lp-bd-tab" onClick={() => handleNavigate('module3')}>
                  <span className="lp-bd-tab-dot lp-bd-tab-dot--green" />
                  {t('landing.bento.modules.tab.learning')}
                </button>
              </div>
              <p className="lp-bd-mod-desc">
                {t('landing.bento.modules.desc')}
              </p>
            </div>
          </div>

          <div className="lp-bd-center">
            <div className="lp-bd-card lp-bd-neuron-card">
              <div className="lp-bd-neuron-canvas">
                <Suspense fallback={<div className="lp-canvas-fallback" />}>
                  <NeuronShowcase />
                </Suspense>
              </div>
              <div className="lp-bd-neuron-caption">
                <p className="lp-bd-caption-text">{t('landing.bento.neuron.caption')}</p>
                <p className="lp-bd-caption-sub">{t('landing.bento.neuron.sub')}</p>
              </div>
            </div>
          </div>

          <div className="lp-bd-right">
            <div className="lp-bd-card lp-bd-stats-card">
              <p className="lp-bd-overline">{t('landing.bento.stats.overline')}</p>
              <span className="lp-bd-big-stat">86B</span>
              <p className="lp-bd-stat-label">{t('landing.bento.stats.label')}</p>
              <div className="lp-bd-stat-bar-group">
                {[
                  { label: t('landing.bento.stats.bar.neurons'), pct: 85, color: '#2D7EFF' },
                  { label: t('landing.bento.stats.bar.synapses'), pct: 100, color: '#7C3AED' },
                  { label: t('landing.bento.stats.bar.reflexes'), pct: 40, color: '#10B981' },
                ].map((b) => (
                  <div key={b.label} className="lp-bd-bar-row">
                    <span className="lp-bd-bar-label">{b.label}</span>
                    <div className="lp-bd-bar-track">
                      <div className="lp-bd-bar-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lp-bd-card lp-bd-schedule">
              <p className="lp-bd-overline">{t('landing.bento.schedule.overline')}</p>
              {courseModules.map((m) => (
                <button key={m.mod} className="lp-bd-sched-row" onClick={() => handleNavigate(m.key)}>
                  <span className="lp-bd-sched-dot" style={{ background: m.color }} />
                  <span className="lp-bd-sched-info">
                    <span className="lp-bd-sched-mod">{m.mod}</span>
                    <span className="lp-bd-sched-label">{m.label}</span>
                  </span>
                  <span className="lp-bd-sched-time">{m.time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lp-bd-bottom">
          <h2 className="lp-bd-bottom-headline">
            {t('landing.bento.bottom.headline.line1')}<br />{t('landing.bento.bottom.headline.line2')}<span className="lp-hero-accent">{t('landing.bento.bottom.headline.accent')}</span>
          </h2>
          <button className="lp-btn-text" onClick={scrollToModules}>
            {t('landing.bento.bottom.cta')}
            <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
          </button>
        </div>
      </section>

      <section className="lp-narrative">
        <div className="lp-narrative-inner">
          <div className="lp-nr-row">
            <div className="lp-nr-text">
              <p className="lp-nr-label lp-section-label">{t('landing.narrative.module1.label')}</p>
              <h2 className="lp-nr-heading">{t('landing.narrative.module1.heading.line1')}<br />{t('landing.narrative.module1.heading.line2')}</h2>
              <p className="lp-nr-body">
                {t('landing.narrative.module1.body')}
              </p>
              <div className="lp-nr-bigstats">
                <div className="lp-bigstat">
                  <span className="lp-bigstat-value">86B</span>
                  <span className="lp-bigstat-label">{t('landing.narrative.module1.stat.neurons')}</span>
                </div>
                <div className="lp-bigstat">
                  <span className="lp-bigstat-value">100T</span>
                  <span className="lp-bigstat-label">{t('landing.narrative.module1.stat.synapses')}</span>
                </div>
              </div>
            </div>
            <div className="lp-nr-visual">
              <div className="lp-anatomy-card">
                <p className="lp-anatomy-heading">{t('landing.narrative.module1.anatomy.heading')}</p>
                <div className="lp-anatomy-steps">
                  {anatomySteps.map((step) => (
                    <div key={step.label} className={`lp-anatomy-step lp-anatomy-step--${step.color}`}>
                      <span className="lp-anatomy-label">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button className="lp-btn-secondary" onClick={() => handleNavigate('module1')}>
                  {t('landing.narrative.module1.cta')} <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lp-nr-row lp-nr-row--reverse">
            <div className="lp-nr-text">
              <p className="lp-nr-label lp-section-label">{t('landing.narrative.module2.label')}</p>
              <h2 className="lp-nr-heading">{t('landing.narrative.module2.heading.line1')}<br />{t('landing.narrative.module2.heading.line2')}</h2>
              <p className="lp-nr-body">
                {t('landing.narrative.module2.body')}
              </p>
              <button className="lp-btn-secondary" onClick={() => handleNavigate('module2')}>
                {t('landing.narrative.module2.cta')} <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
              </button>
            </div>
            <div className="lp-nr-visual" ref={patternRef}>
              <div className="lp-dot-visual">
                <p className="lp-dot-status">
                  {dotResolved ? t('landing.narrative.module2.status.detected') : t('landing.narrative.module2.status.analyzing')}
                </p>
                <DotGrid resolved={dotResolved} />
                <p className="lp-dot-caption">
                  {dotResolved ? t('landing.narrative.module2.caption.detected') : t('landing.narrative.module2.caption.analyzing')}
                </p>
              </div>
            </div>
          </div>

          <div className="lp-nr-row">
            <div className="lp-nr-text">
              <p className="lp-nr-label lp-section-label">{t('landing.narrative.module3.label')}</p>
              <h2 className="lp-nr-heading">{t('landing.narrative.module3.heading.line1')}<br />{t('landing.narrative.module3.heading.line2')}</h2>
              <p className="lp-nr-body">
                {t('landing.narrative.module3.body1')}
              </p>
              <p className="lp-nr-body">
                {t('landing.narrative.module3.body2')}
              </p>
              <button className="lp-btn-secondary" onClick={() => handleNavigate('module3')}>
                {t('landing.narrative.module3.cta')} <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
              </button>
            </div>
            <div className="lp-nr-visual">
              <div className="lp-anatomy-card">
                <p className="lp-anatomy-heading">{t('landing.narrative.module3.anatomy.heading')}</p>
                <div className="lp-anatomy-steps">
                  <div className="lp-anatomy-step lp-anatomy-step--blue">
                    <span className="lp-anatomy-label">{t('landing.narrative.module3.anatomy.step1')}</span>
                  </div>
                  <div className="lp-anatomy-step lp-anatomy-step--amber">
                    <span className="lp-anatomy-label">{t('landing.narrative.module3.anatomy.step2')}</span>
                  </div>
                  <div className="lp-anatomy-step lp-anatomy-step--green">
                    <span className="lp-anatomy-label">{t('landing.narrative.module3.anatomy.step3')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-final-cta">
        <div className="lp-final-inner">
          <h2 className="lp-final-heading">
            {t('landing.final.heading.line1')}<br />{t('landing.final.heading.line2')}<span className="lp-hero-accent">{t('landing.final.heading.accent')}</span>
          </h2>
          <p className="lp-final-sub">
            {t('landing.final.sub')}
          </p>
          <div className="lp-final-actions">
            <button className="lp-btn-primary lp-btn-primary--xl" onClick={onStart}>
              {t('landing.final.begin')} <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
