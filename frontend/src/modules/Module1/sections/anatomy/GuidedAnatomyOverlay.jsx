import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useT } from '../../../../i18n/useT'
import neuronDiagram from '../../../../assets/vector-diagram-of-neuron-anatomy.svg'
import dendritesZoom from '../../../../assets/nerons/Dendrites.png'
import axonZoom from '../../../../assets/nerons/Axon.png'
import terminalsZoom from '../../../../assets/nerons/Terminals.png'
import somaZoom from '../../../../assets/nerons/Soma.png'
import './guidedAnatomy.css'

export default function GuidedAnatomyOverlay({ onComplete, finishLabel = "Got it - let's experiment" }) {
  const t = useT()
  const [currentStep, setCurrentStep] = useState(-1)
  const [visited, setVisited] = useState(new Set())
  const steps = [
    {
      id: 'dendrites',
      label: t('module1.guided.step.dendrites.label'),
      desc: t('module1.guided.step.dendrites.desc'),
      x: '12%',
      y: '35%',
      highlightArea: { left: '0%', top: '5%', width: '28%', height: '90%' },
      zoomImage: dendritesZoom,
    },
    {
      id: 'soma',
      label: t('module1.guided.step.soma.label'),
      desc: t('module1.guided.step.soma.desc'),
      x: '32%',
      y: '48%',
      highlightArea: { left: '22%', top: '20%', width: '22%', height: '55%' },
      zoomImage: somaZoom,
    },
    {
      id: 'axon',
      label: t('module1.guided.step.axon.label'),
      desc: t('module1.guided.step.axon.desc'),
      x: '62%',
      y: '50%',
      highlightArea: { left: '42%', top: '35%', width: '35%', height: '35%' },
      zoomImage: axonZoom,
    },
    {
      id: 'terminals',
      label: t('module1.guided.step.terminals.label'),
      desc: t('module1.guided.step.terminals.desc'),
      x: '88%',
      y: '45%',
      highlightArea: { left: '80%', top: '20%', width: '20%', height: '70%' },
      zoomImage: terminalsZoom,
    },
  ]
  const isStarted = currentStep >= 0
  const allVisited = visited.size === steps.length

  const handleStepClick = (index) => {
    if (index !== currentStep + 1 && !visited.has(index)) return
    setCurrentStep(index)
    setVisited((prev) => new Set([...prev, index]))
  }

  const handleContinue = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1
      setCurrentStep(next)
      setVisited((prev) => new Set([...prev, next]))
    }
  }

  const handleFinish = () => {
    onComplete?.()
  }

  const currentActiveStep = currentStep >= 0 ? steps[currentStep] : null

  return (
    <div className="ga">
      <div className="ga-diagram">
        <img
          className="ga-diagram-img"
          src={neuronDiagram}
          alt={t('module1.guided.diagram.alt')}
          draggable={false}
        />

        {isStarted && <div className="ga-dim" />}

        {isStarted && currentActiveStep && (
          <motion.div
            key={currentActiveStep.id}
            className="ga-highlight"
            style={currentActiveStep.highlightArea}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {steps.map((step, i) => {
          const isActive = currentStep === i
          const isVisited = visited.has(i)
          const isNext = i === currentStep + 1 || (currentStep === -1 && i === 0)

          return (
            <button
              key={step.id}
              className={`ga-hotspot${isActive ? ' ga-hotspot--active' : ''}${isVisited && !isActive ? ' ga-hotspot--visited' : ''}${isNext && !isVisited ? ' ga-hotspot--next' : ''}`}
              style={{ left: step.x, top: step.y }}
              onClick={() => (isNext || isVisited ? handleStepClick(i) : null)}
              disabled={!isNext && !isVisited}
            >
              <span className="ga-hotspot-ring" />
              {(isActive || isVisited) && <span className="ga-hotspot-label">{step.label}</span>}
              {isNext && !isVisited && <span className="ga-hotspot-pulse" />}
            </button>
          )
        })}
      </div>

      <div className="ga-footer">
        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.div
              key="start"
              className="ga-prompt"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <p className="ga-prompt-text">
                {t('module1.guided.prompt')}
              </p>
            </motion.div>
          ) : currentActiveStep ? (
            <motion.div
              key={currentActiveStep.id}
              className="ga-info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="ga-info-header">
                <span className="ga-info-step">
                  {currentStep + 1} / {steps.length}
                </span>
                <h3 className="ga-info-title">{currentActiveStep.label}</h3>
              </div>
              <p className="ga-info-desc">{currentActiveStep.desc}</p>
              {allVisited ? (
                <button className="shared-btn shared-btn-primary shared-btn-sm" onClick={handleFinish}>
                  {finishLabel}
                </button>
              ) : (
                <button className="shared-btn shared-btn-secondary shared-btn-sm" onClick={handleContinue}>
                  {t('module1.guided.next')}
                </button>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="ga-dots">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={`ga-dot${currentStep === i ? ' ga-dot--active' : ''}${visited.has(i) ? ' ga-dot--visited' : ''}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentActiveStep?.id ?? 'zoom-idle'}
          className={`ga-zoom-card${currentActiveStep ? '' : ' ga-zoom-card--idle'}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24 }}
        >
          <div className="ga-zoom-header">
            <span className="ga-info-step">{currentActiveStep ? t('module1.guided.zoom.closeUp') : t('module1.guided.zoom.clickToZoom')}</span>
            <h4 className="ga-zoom-title">{currentActiveStep ? currentActiveStep.label : t('module1.guided.zoom.pick')}</h4>
          </div>
          <div className="ga-zoom-frame">
            {currentActiveStep ? (
              <div className="ga-zoom-stage">
                <img
                  className="ga-zoom-image ga-zoom-image--static"
                  src={currentActiveStep.zoomImage}
                  alt={t('module1.guided.zoom.alt', { label: currentActiveStep.label })}
                  draggable={false}
                />
              </div>
            ) : (
              <div className="ga-zoom-empty">
                {t('module1.guided.zoom.empty')}
              </div>
            )}
          </div>
          <p className="ga-zoom-caption">
            {currentActiveStep
              ? t('module1.guided.zoom.caption.active', { label: currentActiveStep.label })
              : t('module1.guided.zoom.caption.idle')}
          </p>
          <div className="ga-attribution" aria-label={t('module1.guided.attribution.aria')}>
            <p className="ga-attribution-line">
              {t('module1.guided.attribution.overview')}{' '}
              <a href="https://commons.wikimedia.org/wiki/File:Complete_neuron_cell_diagram_en.svg" target="_blank" rel="noreferrer">
                {t('module1.guided.attribution.link')}
              </a>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
