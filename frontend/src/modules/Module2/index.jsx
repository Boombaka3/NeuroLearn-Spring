import { useCallback, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ModuleNav from '../../components/ui/ModuleNav'
import useScrollProgress from '../../hooks/useScrollProgress'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectModuleSectionProgress, setModuleSectionProgress } from '../../store/progress'
import { updateSectionProgress } from '../../store/userProgress/userProgressSlice'
import SpecialistsSection from './sections/selectivity/SpecialistsSection'
import ScanningSection from './sections/cnn/ScanningSection'
import CnnExplainerSection from './sections/cnn/CnnExplainerSection'
import './module2.css'
import { useT } from '../../i18n/useT'

gsap.registerPlugin(ScrollTrigger)

function Module2({ onBack, onContinue, onNavigate }) {
  const t = useT()
  const SECTIONS = [
    { label: t('module2.nav.selectivity') },
    { label: t('module2.nav.cnns') },
    { label: t('module2.nav.explainer') },
  ]
  const dispatch = useAppDispatch()
  const savedProgress = useAppSelector(selectModuleSectionProgress('module2'))
  const handleProgressChange = useCallback(({ activeIndex: nextActiveIndex, visitedIndices: nextVisitedIndices }) => {
    dispatch(setModuleSectionProgress({
      moduleKey: 'module2',
      activeIndex: nextActiveIndex,
      visitedIndices: nextVisitedIndices,
    }))
  }, [dispatch])
  const { activeIndex, visitedIndices, setRef, scrollTo, refs } = useScrollProgress(SECTIONS.length, {
    initialActiveIndex: savedProgress.activeIndex,
    initialVisitedIndices: savedProgress.visitedIndices,
    onProgressChange: handleProgressChange,
  })

  useEffect(() => {
    if (savedProgress.activeIndex <= 0) return

    const timeoutId = window.setTimeout(() => {
      scrollTo(savedProgress.activeIndex)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [savedProgress.activeIndex, scrollTo])

  useEffect(() => {
    dispatch(updateSectionProgress({
      moduleId: 'module2',
      sectionIndex: activeIndex,
      totalSections: SECTIONS.length,
    }))
  }, [activeIndex, dispatch])

  useEffect(() => {
    const ctx = gsap.context(() => {
      refs.current.forEach((el) => {
        if (!el) return
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          y: 24, opacity: 0, duration: 0.65, ease: 'power2.out',
        })
      })
    })
    return () => ctx.revert()
  }, [refs])

  return (
    <div className="module2-page">
      <ModuleNav
        current="module2"
        sections={SECTIONS}
        activeIndex={activeIndex}
        visitedIndices={visitedIndices}
        onSectionClick={scrollTo}
        onBack={onBack}
        onCourseStepClick={onNavigate}
      />

      <main className="m2-main">
        <div ref={setRef(0)}><SpecialistsSection /></div>
        <div ref={setRef(1)}><ScanningSection /></div>
        <div ref={setRef(2)}><CnnExplainerSection /></div>

        <section className="m2-section m2-continue-section">
          <div className="m2-continue-card" onClick={onContinue} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onContinue?.()}>
            <p className="m2-eyebrow">{t('module2.upNext')}</p>
            <h2>{t('module2.nextTitle')}</h2>
            <p className="m2-section-subtitle">{t('module2.nextBody')}</p>
            <span className="m2-continue-btn">{t('ui.continue')}</span>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Module2
