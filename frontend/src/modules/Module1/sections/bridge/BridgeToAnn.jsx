import { useState } from 'react'
import AnnDiagram from '../../../../components/diagrams/AnnDiagram'
import biologicalNeuronBridgeImage from '../../../../assets/ChatGPT Image Apr 24, 2026, 01_40_31 PM.png'
import { useT } from '../../../../i18n/useT'
import ConnectedNetworkSection from './ConnectedNetworkSection'

function BridgeToAnn() {
  const t = useT()
  const mappingSteps = [
    {
      id: 'inputs',
      buttonLabel: t('module1.bridge.mapping.inputs.button'),
      highlightLabel: t('module1.bridge.mapping.inputs.highlight'),
      bioTitle: t('module1.bridge.mapping.inputs.bioTitle'),
      bioText: t('module1.bridge.mapping.inputs.bioText'),
      annTitle: t('module1.bridge.mapping.inputs.annTitle'),
      annText: t('module1.bridge.mapping.inputs.annText'),
      takeaway: t('module1.bridge.mapping.inputs.takeaway'),
    },
    {
      id: 'combine',
      buttonLabel: t('module1.bridge.mapping.combine.button'),
      highlightLabel: t('module1.bridge.mapping.combine.highlight'),
      bioTitle: t('module1.bridge.mapping.combine.bioTitle'),
      bioText: t('module1.bridge.mapping.combine.bioText'),
      annTitle: t('module1.bridge.mapping.combine.annTitle'),
      annText: t('module1.bridge.mapping.combine.annText'),
      takeaway: t('module1.bridge.mapping.combine.takeaway'),
    },
    {
      id: 'output',
      buttonLabel: t('module1.bridge.mapping.output.button'),
      highlightLabel: t('module1.bridge.mapping.output.highlight'),
      bioTitle: t('module1.bridge.mapping.output.bioTitle'),
      bioText: t('module1.bridge.mapping.output.bioText'),
      annTitle: t('module1.bridge.mapping.output.annTitle'),
      annText: t('module1.bridge.mapping.output.annText'),
      takeaway: t('module1.bridge.mapping.output.takeaway'),
    },
    {
      id: 'connection',
      buttonLabel: t('module1.bridge.mapping.connection.button'),
      highlightLabel: t('module1.bridge.mapping.connection.highlight'),
      bioTitle: t('module1.bridge.mapping.connection.bioTitle'),
      bioText: t('module1.bridge.mapping.connection.bioText'),
      annTitle: t('module1.bridge.mapping.connection.annTitle'),
      annText: t('module1.bridge.mapping.connection.annText'),
      takeaway: t('module1.bridge.mapping.connection.takeaway'),
    },
  ]
  const [activeStepId, setActiveStepId] = useState(mappingSteps[0].id)
  const activeStep = mappingSteps.find((step) => step.id === activeStepId) ?? mappingSteps[0]

  return (
    <section className="module1-section module1-bridge-section">
      <div className="module1-section-heading module1-bridge-heading">
        <p className="module1-eyebrow">{t('module1.bridge.eyebrow')}</p>
        <h2>{t('module1.bridge.title')}</h2>
        <p>{t('module1.bridge.body')}</p>
      </div>

      <section className="module1-bridge-mapping-panel module1-panel module1-soft-panel">
        <div className="module1-bridge-mapping-header">
          <div>
            <p className="module1-bridge-footer-title">{t('module1.bridge.mapping.title')}</p>
          </div>
        </div>

        <div className="bridge-mapping-list" aria-label={t('module1.bridge.mapping.aria')}>
          {mappingSteps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={`bridge-mapping-btn${activeStep.id === step.id ? ' bridge-mapping-btn--active' : ''}`}
              onClick={() => setActiveStepId(step.id)}
              aria-pressed={activeStep.id === step.id}
            >
              <span className="bridge-mapping-btn__index">{index + 1}</span>
              <span className="bridge-mapping-btn__text">{step.buttonLabel}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bridge-comparison module1-bridge-comparison">
        <div className="bridge-panel bridge-panel-bio module1-panel module1-soft-panel">
          <div className="module1-bridge-panel-header">
            <div>
              <h3 className="module1-panel-title module1-panel-title-large">{t('module1.bridge.bio.title')}</h3>
              <p className="module1-card-muted">{t('module1.bridge.bio.body')}</p>
            </div>
            <span className="module1-bridge-current-label">{t('module1.bridge.bio.badge')}</span>
          </div>

          <div className="bridge-visual bridge-visual-bio module1-bridge-shell module1-bridge-shell-bio">
            <div className="module1-bridge-bio-stage">
              <img
                className="module1-bridge-bio-image"
                src={biologicalNeuronBridgeImage}
                alt={t('module1.bridge.bio.image.alt')}
              />
              <div className="module1-bridge-bio-scrim" aria-hidden="true" />
              {mappingSteps.map((step) => (
                <div
                  key={step.id}
                  className={`module1-bridge-bio-focus module1-bridge-bio-focus--${step.id}${activeStep.id === step.id ? ' is-active' : ''}`}
                  aria-hidden="true"
                >
                  <span className="module1-bridge-bio-tag">{step.highlightLabel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bridge-panel bridge-panel-ann module1-panel module1-soft-panel">
          <div className="module1-bridge-panel-header">
            <div>
              <h3 className="module1-panel-title">{t('module1.bridge.ann.title')}</h3>
              <p className="module1-card-muted">{t('module1.bridge.ann.body')}</p>
            </div>
            <span className="module1-bridge-current-label">{t('module1.bridge.ann.badge')}</span>
          </div>

          <div className="bridge-visual bridge-visual-ann module1-bridge-shell module1-bridge-shell-ann">
            <AnnDiagram variant="bridge" activeBridgePart={activeStep.id} />
          </div>
        </div>
      </section>

      <section className="module1-bridge-mapping-panel module1-panel module1-soft-panel" aria-live="polite">
        <div className="module1-bridge-mapping-header">
          <div>
            <p className="module1-bridge-footer-title">
              {t('module1.bridge.stepPrefix', {
                current: mappingSteps.findIndex((step) => step.id === activeStep.id) + 1,
                total: mappingSteps.length,
              })}
            </p>
            <h3 className="module1-panel-title">{activeStep.buttonLabel}</h3>
          </div>
        </div>

        <div className="module1-mapping-list-bridge">
          <article className="module1-mapping-item">
            <p className="module1-bridge-footer-title">{t('module1.bridge.side.bio')}</p>
            <h4>{activeStep.bioTitle}</h4>
            <p>{activeStep.bioText}</p>
          </article>

          <article className="module1-mapping-item">
            <p className="module1-bridge-footer-title">{t('module1.bridge.side.ann')}</p>
            <h4>{activeStep.annTitle}</h4>
            <p>{activeStep.annText}</p>
          </article>
        </div>

        <p className="bridge-summary">{activeStep.takeaway}</p>
      </section>

      <ConnectedNetworkSection />
    </section>
  )
}

export default BridgeToAnn
