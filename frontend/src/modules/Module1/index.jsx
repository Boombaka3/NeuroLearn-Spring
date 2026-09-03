import { useCallback, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ModuleNav from '../../components/ui/ModuleNav'
import { useT } from '../../i18n/useT'
import useScrollProgress from '../../hooks/useScrollProgress'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectModuleSectionProgress, setModuleSectionProgress } from '../../store/progress'
import { updateSectionProgress } from '../../store/userProgress/userProgressSlice'
import ActivationSection from './sections/activation/ActivationSection'
import BridgeToAnn from './sections/bridge/BridgeToAnn'
import InteractionSection from './sections/interaction/InteractionSection'
import Module1AnatomySection from './sections/anatomy/Module1AnatomySection'
import Module1Intro from './sections/intro/Module1Intro'
import './module1.css'

gsap.registerPlugin(ScrollTrigger)

function Module1({ onBack, onContinue, onNavigate }) {
  const t = useT()
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false)
  const dispatch = useAppDispatch()
  const sections = [
    { label: t('module1.nav.section.introduction') },
    { label: t('module1.nav.section.anatomy') },
    { label: t('module1.nav.section.sound') },
    { label: t('module1.nav.section.bridge') },
    { label: t('module1.nav.section.activation') },
  ]
  const savedProgress = useAppSelector(selectModuleSectionProgress('module1'))
  const handleProgressChange = useCallback(({ activeIndex: nextActiveIndex, visitedIndices: nextVisitedIndices }) => {
    dispatch(setModuleSectionProgress({
      moduleKey: 'module1',
      activeIndex: nextActiveIndex,
      visitedIndices: nextVisitedIndices,
    }))
  }, [dispatch])
  const { activeIndex, visitedIndices, setRef, scrollTo, refs } = useScrollProgress(sections.length, {
    initialActiveIndex: savedProgress.activeIndex,
    initialVisitedIndices: savedProgress.visitedIndices,
    onProgressChange: handleProgressChange,
  })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [refs])

  useEffect(() => {
    dispatch(updateSectionProgress({
      moduleId: 'module1',
      sectionIndex: activeIndex,
      totalSections: sections.length,
    }))
  }, [activeIndex, dispatch, sections.length])

  useEffect(() => {
    if (savedProgress.activeIndex <= 0) return

    const timeoutId = window.setTimeout(() => {
      scrollTo(savedProgress.activeIndex)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [savedProgress.activeIndex, scrollTo])

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
  }, [])

  return (
    <div className="module1-page">
      <ModuleNav
        current="module1"
        sections={sections}
        activeIndex={activeIndex}
        visitedIndices={visitedIndices}
        onSectionClick={scrollTo}
        onBack={onBack}
        onCourseStepClick={onNavigate}
      />

      <main className="module1-main">
        <div ref={setRef(0)}>
          <Module1Intro onStart={() => scrollTo(1)} />
        </div>

        <div ref={setRef(1)} className="module1-anchor-section">
          <Module1AnatomySection onContinue={() => scrollTo(2)} />
        </div>

        <div ref={setRef(2)} className="module1-anchor-section">
          <InteractionSection isMobile={isMobile} />
        </div>

        <section ref={setRef(3)} className="module1-anchor-section">
          <BridgeToAnn />
        </section>

        <section ref={setRef(4)} className="module1-anchor-section">
          <ActivationSection onContinue={onContinue} />
        </section>
      </main>
    </div>
  )
}

export default Module1
