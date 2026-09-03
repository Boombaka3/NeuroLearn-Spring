import { useEffect, useRef } from 'react'
import { useT } from '../../../../i18n/useT'
import PhetNeuronEmbed, {
} from './PhetNeuronEmbed'
import usePhetNeuronController from '../../hooks/usePhetNeuronController'

function PhetNeuronPanel({
  title = 'Test the neuron',
  helperText = 'Use the controls below to stimulate the neuron and watch how it responds.',
  showStatus = true,
  showPlayback = true,
  showAttribution = false,
  compact = false,
  showIntro = true,
  autoStimulateToken = 0,
}) {
  const t = useT()
  const {
    iframeRef,
    isLoaded,
    bridgeReady,
    runtimeState,
    handleFrameLoad,
    runtimeLabel,
    runtimeDetail,
    simEventState,
    handlePlay,
    handlePause,
    handleStepBackward,
    handleStepForward,
    handleReset,
    handleStimulate,
    handleSpeedSlow,
    handleSpeedNormal,
    handleSpeedFast,
    handleSetAllIons,
    handleSetCharges,
    handleSetConcentrations,
    handleSetPotentialChart,
  } = usePhetNeuronController()
  const lastAutoStimulateTokenRef = useRef(0)

  useEffect(() => {
    if (autoStimulateToken <= 0 || autoStimulateToken === lastAutoStimulateTokenRef.current) {
      return
    }

    if (!runtimeState.canStimulate) {
      return
    }

    lastAutoStimulateTokenRef.current = autoStimulateToken
    handleStimulate()
  }, [autoStimulateToken, handleStimulate, runtimeState.canStimulate])

  const shellClassName = [
    'module1-phet-panel',
    'module1-phet-panel--embedded',
    compact ? 'module1-phet-panel--compact' : '',
    simEventState === 'firing' ? 'is-firing' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClassName}>
      {showIntro && (
        <div className="module1-phet-panel__intro">
          <h3 className="module1-phet-panel__title">{title}</h3>
          <p className="module1-phet-panel__runtime-copy">{helperText}</p>
        </div>
      )}

      {showStatus && (
        <div className="module1-phet-panel__status-row">
          <span
            className={[
              'module1-phet-panel__status-pill',
              `is-${simEventState}`,
              bridgeReady ? 'is-bridge-ready' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {runtimeLabel}
          </span>
          <span className="module1-phet-panel__status-meta">{runtimeDetail}</span>
        </div>
      )}

      <div className="module1-phet-panel__controls">
        <div className="module1-phet-panel__controls-main">
          <section className="module1-phet-panel__control-group module1-phet-panel__control-group--actions">
            <h4>{t('module1.phet.controls.response')}</h4>
            <div className="module1-phet-panel__control-row module1-phet-panel__control-row--compact">
              <button type="button" className="module1-phet-panel__button module1-phet-panel__button--primary" onClick={handleStimulate} disabled={!runtimeState.canStimulate}>
                {t('module1.phet.controls.stimulate')}
              </button>
              <button type="button" className="module1-phet-panel__button module1-phet-panel__button--secondary" onClick={handleReset} disabled={!runtimeState.canReset}>
                {t('module1.phet.controls.reset')}
              </button>
            </div>
          </section>

          <section className="module1-phet-panel__control-group module1-phet-panel__control-group--speed">
            <h4>{t('module1.phet.controls.speed')}</h4>
            <div className="module1-phet-panel__control-row module1-phet-panel__control-row--chips">
              <button type="button" className={runtimeState.speed === 'slow' ? 'is-active' : ''} onClick={handleSpeedSlow}>{t('module1.phet.controls.speed.slow')}</button>
              <button type="button" className={runtimeState.speed === 'normal' ? 'is-active' : ''} onClick={handleSpeedNormal}>{t('module1.phet.controls.speed.normal')}</button>
              <button type="button" className={runtimeState.speed === 'fast' ? 'is-active' : ''} onClick={handleSpeedFast}>{t('module1.phet.controls.speed.fast')}</button>
            </div>
          </section>
        </div>

        {showPlayback && (
          <section className="module1-phet-panel__control-group module1-phet-panel__control-group--playback">
            <h4>Playback</h4>
            <div className="module1-phet-panel__control-row">
              <button type="button" onClick={handlePlay} disabled={!runtimeState.canPlay}>Play</button>
              <button type="button" onClick={handlePause} disabled={!runtimeState.canPause}>Pause</button>
              <button type="button" onClick={handleStepBackward} disabled={!runtimeState.canStepBackward}>Step backward</button>
              <button type="button" onClick={handleStepForward} disabled={!runtimeState.canStepForward}>Step forward</button>
            </div>
          </section>
        )}

        <details className="module1-phet-panel__details">
          <summary className="module1-phet-panel__details-summary">{t('module1.phet.controls.viewOptions')}</summary>
          <section className="module1-phet-panel__control-group module1-phet-panel__control-group--advanced">
            <p className="module1-phet-panel__details-copy">{t('module1.phet.controls.viewOptions.copy')}</p>
            <div className="module1-phet-panel__toggle-row">
              <label>
                <input type="checkbox" checked={runtimeState.allIons} onChange={(event) => handleSetAllIons(event.target.checked)} />
                <span>{t('module1.phet.controls.toggle.allIons')}</span>
              </label>
              <label>
                <input type="checkbox" checked={runtimeState.charges} onChange={(event) => handleSetCharges(event.target.checked)} />
                <span>{t('module1.phet.controls.toggle.charges')}</span>
              </label>
              <label>
                <input type="checkbox" checked={runtimeState.concentrations} onChange={(event) => handleSetConcentrations(event.target.checked)} />
                <span>{t('module1.phet.controls.toggle.concentrations')}</span>
              </label>
              <label>
                <input type="checkbox" checked={runtimeState.potentialChart} onChange={(event) => handleSetPotentialChart(event.target.checked)} />
                <span>{t('module1.phet.controls.toggle.potentialChart')}</span>
              </label>
            </div>
          </section>
        </details>
      </div>

      <PhetNeuronEmbed iframeRef={iframeRef} onFrameLoad={handleFrameLoad} />

      {showAttribution && (
        <p className="module1-phet-panel__attribution">
          {isLoaded ? `${t('module1.phet.attribution.loaded')} ` : ''}
          {t('module1.phet.attribution.prefix')}{' '}
          <a href="https://github.com/phetsims/neuron" target="_blank" rel="noreferrer">
            PhET Interactive Simulations
          </a>
        </p>
      )}
    </div>
  )
}

export default PhetNeuronPanel
