import { useState } from 'react'
import { useT } from '../../../../i18n/useT'
import FloatingSignal from './FloatingSignal'
import NeuronResponsePanel from './NeuronResponsePanel'
import PhetNeuronPanel from './PhetNeuronPanel'
import neuronFiringVideo from '../../../../assets/firing/neurons_s1.mp4'
import { staticPayAttentionSvg } from '../intro/module1SceneAssets'
import useSoundNeuronExperiment, { EXAMPLE_SIGNALS, MAX_INPUT, THRESHOLD } from '../../hooks/useSoundNeuronExperiment'
import './soundNeuronExperiment.css'

function SoundNeuronExperiment() {
  const t = useT()
  const {
    currentPhrase,
    somaInput,
    recentSignals,
    isAnimating,
    isFiring,
    lastResult,
    autoStimulateToken,
    setCurrentPhrase,
    submitCurrentPhrase,
    submitExamplePhrase,
  } = useSoundNeuronExperiment()
  const [showFiringVideo, setShowFiringVideo] = useState(false)

  const somaFillPercent = Math.max(0, Math.min(100, (somaInput / MAX_INPUT) * 100))
  const thresholdPercent = (THRESHOLD / MAX_INPUT) * 100

  return (
    <div className="module1-sound-neuron">
      <div className="module1-sound-neuron__shell">
        <div className="module1-sound-neuron__intro">
          <p className="module1-eyebrow module1-eyebrow-tight">{t('module1.sound.eyebrow')}</p>
          <h2 className="module1-sound-neuron__title">{t('module1.sound.title')}</h2>
          <p className="module1-card-muted module1-text-reset">
            {t('module1.sound.body')}
          </p>
        </div>

        <form className="module1-sound-neuron__composer" onSubmit={submitCurrentPhrase}>
          <div className="module1-sound-neuron__input-row">
            <input
              id="module1-sound-neuron-input"
              type="text"
              value={currentPhrase}
              onChange={(event) => setCurrentPhrase(event.target.value)}
              placeholder={t('module1.sound.input.placeholder')}
              autoComplete="off"
            />
            <button type="submit" className="module1-primary-button module1-sound-neuron__send-button">
              {t('module1.sound.input.send')}
            </button>
          </div>
        </form>

        <div className="module1-sound-neuron__examples" aria-label={t('module1.sound.examples.aria')}>
          {EXAMPLE_SIGNALS.map((example) => (
            <button
              key={example.value}
              type="button"
              className="module1-sound-neuron__example-chip"
              onClick={() => submitExamplePhrase(example.value)}
            >
              {t(example.key)}
            </button>
          ))}
        </div>

        <div className={`module1-sound-neuron__workspace ${isAnimating ? 'is-animating' : ''}`}>
          <div className="module1-sound-neuron__scene-panel">
            <div className="module1-sound-neuron__scene-art" aria-hidden="true">
              <div
                className="module1-sound-neuron__scene-art-body"
                dangerouslySetInnerHTML={{ __html: staticPayAttentionSvg }}
              />
              <div className="module1-sound-neuron__signal-overlay">
                {recentSignals.map((signal) => (
                  <FloatingSignal
                    key={signal.id}
                    phrase={signal.phrase}
                    impact={signal.impact}
                    strength={signal.strength}
                    isAlexCue={signal.isAlexCue}
                    duration={signal.duration}
                    scale={signal.scale}
                    laneOffset={signal.laneOffset}
                  />
                ))}
              </div>
            </div>
            <div className="module1-sound-neuron__scene-hint">{t('module1.sound.scene.hint')}</div>
          </div>

          <div className="module1-sound-neuron__neuron-panel">
            <div className="module1-sound-neuron__panel-header">
              <div>
                <h3 className="module1-sound-neuron__panel-title">{t('module1.sound.panel.title')}</h3>
                <p className="module1-sound-neuron__panel-copy">{t('module1.sound.panel.copy')}</p>
              </div>
            </div>

            <NeuronResponsePanel lastResult={lastResult} />

            <div className="module1-sound-neuron__meter">
              <div className="module1-sound-neuron__meter-header">
                <span className="module1-sound-neuron__meter-label">{t('module1.sound.meter.label')}</span>
                <strong>{somaInput} / {MAX_INPUT}</strong>
              </div>
              <div
                className={`module1-sound-neuron__meter-track ${isFiring ? 'is-firing' : ''}`}
                aria-label={t('module1.sound.meter.aria')}
                aria-valuemin={0}
                aria-valuemax={MAX_INPUT}
                aria-valuenow={somaInput}
                role="meter"
              >
                <div className="module1-sound-neuron__meter-fill" style={{ width: `${somaFillPercent}%` }} />
                <div className="module1-sound-neuron__meter-threshold" style={{ left: `${thresholdPercent}%` }}>
                  <span>{t('module1.sound.meter.threshold', { value: THRESHOLD })}</span>
                </div>
              </div>
            </div>
            <PhetNeuronPanel
              title={t('module1.sound.panel.title')}
              helperText={t('module1.sound.phet.helper')}
              showStatus={false}
              showPlayback={false}
              showAttribution
              autoStimulateToken={autoStimulateToken}
              compact
              showIntro={false}
            />
          </div>
        </div>

        <div className="module1-anatomy-video-panel">
          <button
            type="button"
            className="module1-secondary-button module1-anatomy-video-toggle"
            onClick={() => setShowFiringVideo((prev) => !prev)}
          >
            {showFiringVideo ? t('module1.sound.video.hide') : t('module1.sound.video.show')}
          </button>

          {showFiringVideo && (
            <div className="module1-anatomy-video-content">
              <video className="module1-anatomy-video" controls>
                <source src={neuronFiringVideo} type="video/mp4" />
              </video>
              <p className="module1-anatomy-video-credit">
                {t('module1.sound.video.source')} (
                <a
                  href="https://media.hhmi.org/biointeractive/click/Neuron_Activity/01.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://media.hhmi.org/biointeractive/click/Neuron_Activity/01.html
                </a>
                )
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SoundNeuronExperiment
