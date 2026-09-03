import { useState } from 'react'
import LossChart from './LossChart'
import { useT } from '../../../../i18n/useT'

const trainingRounds = [
  {
    round: 0,
    prediction: '8',
    target: '9',
    error: 0.42,
    confidenceTarget: 38,
    confidenceWrong: 62,
    weights: [
      { label: 'Upper curve', value: 0.28 },
      { label: 'Closed loop', value: 0.34 },
      { label: 'Open gap', value: 0.41 },
      { label: 'Lower curve', value: 0.25 },
    ],
  },
  {
    round: 1,
    prediction: '8',
    target: '9',
    error: 0.31,
    confidenceTarget: 49,
    confidenceWrong: 51,
    weights: [
      { label: 'Upper curve', value: 0.31 },
      { label: 'Closed loop', value: 0.43 },
      { label: 'Open gap', value: 0.34 },
      { label: 'Lower curve', value: 0.30 },
    ],
  },
  {
    round: 2,
    prediction: '9',
    target: '9',
    error: 0.22,
    confidenceTarget: 61,
    confidenceWrong: 39,
    weights: [
      { label: 'Upper curve', value: 0.34 },
      { label: 'Closed loop', value: 0.52 },
      { label: 'Open gap', value: 0.28 },
      { label: 'Lower curve', value: 0.36 },
    ],
  },
  {
    round: 3,
    prediction: '9',
    target: '9',
    error: 0.13,
    confidenceTarget: 73,
    confidenceWrong: 27,
    weights: [
      { label: 'Upper curve', value: 0.37 },
      { label: 'Closed loop', value: 0.61 },
      { label: 'Open gap', value: 0.22 },
      { label: 'Lower curve', value: 0.41 },
    ],
  },
  {
    round: 4,
    prediction: '9',
    target: '9',
    error: 0.06,
    confidenceTarget: 86,
    confidenceWrong: 14,
    weights: [
      { label: 'Upper curve', value: 0.40 },
      { label: 'Closed loop', value: 0.70 },
      { label: 'Open gap', value: 0.17 },
      { label: 'Lower curve', value: 0.45 },
    ],
  },
]

function TrainingLab() {
  const t = useT()
  const [roundIndex, setRoundIndex] = useState(0)
  const current = trainingRounds[roundIndex]
  const isComplete = roundIndex === trainingRounds.length - 1
  const strongestWeight = current.weights.reduce((strongest, weight) => (
    weight.value > strongest.value ? weight : strongest
  ), current.weights[0])

  const trainOneRound = () => {
    setRoundIndex((value) => Math.min(value + 1, trainingRounds.length - 1))
  }

  const resetTraining = () => setRoundIndex(0)

  return (
    <div className="m3-training-unified">

      {/* Top row: curve + weight tracker */}
      <div className="m3-training-unified__top">

        {/* Loss curve — dominant left panel */}
        <div className="m3-training-unified__curve">
          <p className="m3-training-card-label">{t('module3.training.errorByRound')}</p>
          <p className="m3-training-unified__curve-hint">{t('module3.training.curveHint')}</p>
          <LossChart trainingHistory={trainingRounds} roundIndex={roundIndex} />
        </div>

        {/* Weight tracker — right panel */}
        <div className="m3-training-unified__weights">
          <p className="m3-training-card-label">{t('module3.training.weightMost')}</p>
          <div className="m3-training-unified__weight-feature">
            <span className="m3-training-unified__weight-name">{t('module3.training.closedLoop')}</span>
            <div className="m3-training-unified__weight-row">
              <span className="m3-training-unified__weight-start">
                {t('module3.training.start')} {trainingRounds[0].weights[1].value.toFixed(2)}
              </span>
              <span className="m3-training-unified__weight-arrow">→</span>
              <span className="m3-training-unified__weight-now">
                {t('module3.training.now')} {current.weights[1].value.toFixed(2)}
              </span>
            </div>
            <div className="m3-training-unified__weight-bar-shell">
              <div
                className="m3-training-unified__weight-bar-fill"
                style={{ width: `${(current.weights[1].value / 1.0) * 100}%` }}
              />
            </div>
            <span className="m3-training-unified__weight-delta">
              {current.round === 0
                ? t('module3.training.noChange')
                : t('module3.training.afterRounds', {
                  delta: (current.weights[1].value - trainingRounds[0].weights[1].value).toFixed(2),
                  round: current.round,
                  plural: current.round === 1 ? '' : 's',
                })
              }
            </span>
          </div>

          {/* Status tiles — compact */}
          <div className="m3-training-unified__tiles">
            <div className="m3-training-unified__tile">
              <span>{t('module3.training.prediction')}</span>
              <strong>{current.prediction}</strong>
            </div>
            <div className="m3-training-unified__tile">
              <span>{t('module3.training.target')}</span>
              <strong>{current.target}</strong>
            </div>
            <div className="m3-training-unified__tile m3-training-unified__tile--error">
              <span>{t('module3.training.error')}</span>
              <strong>{current.error.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: controls */}
      <div className="m3-training-unified__controls">
        <div className="m3-training-unified__round-badge">
          {t('module3.training.round')} <strong>{current.round}</strong> {t('module3.training.of')} {trainingRounds.length - 1}
        </div>
        <div className="m3-training-unified__actions">
          {!isComplete ? (
            <button
              type="button"
              className="m3-btn m3-btn--primary m3-training-unified__advance"
              onClick={trainOneRound}
            >
              {t('module3.training.trainOne')}
            </button>
          ) : (
            <div className="m3-training-unified__complete">
              {t('module3.training.complete', { error: current.error.toFixed(2) })}
            </div>
          )}
          <button type="button" className="m3-btn m3-stepper-reset" onClick={resetTraining}>
            {t('module3.training.reset')}
          </button>
        </div>
        <p className="m3-training-unified__note">
          {t('module3.training.epochNote')}
        </p>
      </div>

    </div>
  )
}

export default TrainingLab
