import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useT } from '../../../../i18n/useT'

function relu(value) {
  return Math.max(0, value)
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value))
}

function toSvgX(value) {
  return 70 + ((value + 3) / 6) * 360
}

function toSvgY(value, yMax = 3.3) {
  return 220 - (value / yMax) * 170
}

function buildActivationPath(activationFn, yMax) {
  const points = []

  for (let x = -3; x <= 3.01; x += 0.1) {
    points.push(`${toSvgX(x).toFixed(1)},${toSvgY(activationFn(x), yMax).toFixed(1)}`)
  }

  return `M ${points.join(' L ')}`
}

function ActivationGraph({ formula, inputValue, outputValue, path, yMax }) {
  const dotX = toSvgX(inputValue)
  const dotY = toSvgY(outputValue, yMax)
  const zeroX = toSvgX(0)

  return (
    <svg viewBox="0 0 500 270" className="ann-diagram-svg" style={{ maxHeight: 270 }}>
      <rect x="24" y="18" width="452" height="230" rx="18" fill="#f8fafc" stroke="#e2e8f0" />
      <text x="250" y="48" textAnchor="middle" fontSize="15" fontWeight="800" fill="#7c3aed">{formula}</text>

      <line x1="70" y1="220" x2="430" y2="220" stroke="#cbd5e1" strokeWidth="1.4" />
      <line x1={zeroX} y1="48" x2={zeroX} y2="226" stroke="#cbd5e1" strokeWidth="1.4" />
      <text x="70" y="240" textAnchor="middle" fontSize="11" fill="#64748b">-3</text>
      <text x={zeroX} y="240" textAnchor="middle" fontSize="11" fill="#64748b">0</text>
      <text x="430" y="240" textAnchor="middle" fontSize="11" fill="#64748b">+3</text>

      <path d={path} fill="none" stroke="#7c3aed" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <motion.line
        x1={dotX}
        y1={dotY}
        x2={dotX}
        y2="220"
        stroke="#7c3aed"
        strokeWidth="1.4"
        strokeDasharray="4 3"
        opacity="0.55"
        animate={{ x1: dotX, x2: dotX, y1: dotY }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      <motion.circle
        cx={dotX}
        cy={dotY}
        r="7"
        fill="#7c3aed"
        animate={{ cx: dotX, cy: dotY }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      <motion.text
        x={dotX}
        y={dotY - 14}
        textAnchor="middle"
        fontSize="12"
        fontWeight="800"
        fill="#7c3aed"
        animate={{ x: dotX, y: dotY - 14 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {outputValue.toFixed(2)}
      </motion.text>
    </svg>
  )
}

function ActivationSection({ onContinue }) {
  const t = useT()
  const [inputValue, setInputValue] = useState(1)
  const reluOutput = relu(inputValue)
  const sigmoidOutput = sigmoid(inputValue)
  const reluPath = useMemo(() => buildActivationPath(relu, 3.3), [])
  const sigmoidPath = useMemo(() => buildActivationPath(sigmoid, 1.1), [])

  return (
    <section className="module1-section module1-activation-section">
      <div className="module1-section-heading">
        <p className="module1-eyebrow">{t('module1.activation.eyebrow')}</p>
        <h2>{t('module1.activation.title')}</h2>
        <p>{t('module1.activation.body')}</p>
      </div>

      <div className="module1-panel module1-soft-panel">
        <p className="module1-card-muted">{t('module1.activation.note')}</p>

        <div
          style={{
            display: 'grid',
            gap: 18,
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            marginTop: 24,
          }}
        >
          <article>
            <ActivationGraph formula="ReLU: f(x) = max(0, x)" inputValue={inputValue} outputValue={reluOutput} path={reluPath} yMax={3.3} />
            <p className="module1-card-muted" style={{ textAlign: 'center' }}>
              {t('module1.activation.relu.output')} <strong>{reluOutput.toFixed(2)}</strong>
            </p>
          </article>

          <article>
            <ActivationGraph formula="Sigmoid: f(x) = 1 / (1 + e^-x)" inputValue={inputValue} outputValue={sigmoidOutput} path={sigmoidPath} yMax={1.1} />
            <p className="module1-card-muted" style={{ textAlign: 'center' }}>
              {t('module1.activation.sigmoid.output')} <strong>{sigmoidOutput.toFixed(3)}</strong>
            </p>
          </article>
        </div>

        <div className="module1-threshold-block" style={{ display: 'grid', justifyItems: 'center', marginTop: 20 }}>
          <label className="module1-threshold-label" htmlFor="module1-relu-slider" style={{ display: 'block', fontSize: '1.2rem', textAlign: 'center' }}>
            {t('module1.activation.input')} <strong>{inputValue > 0 ? '+' : ''}{inputValue.toFixed(1)}</strong>
          </label>
          <input
            id="module1-relu-slider"
            type="range"
            min="-3"
            max="3"
            step="0.1"
            value={inputValue}
            onChange={(event) => setInputValue(Number(event.target.value))}
            style={{ maxWidth: 260, width: '100%' }}
          />
        </div>
      </div>

      <div className="module1-bridge-actions">
        <button className="module1-primary-button" onClick={onContinue}>
          {t('module1.activation.continue')}
        </button>
      </div>
    </section>
  )
}

export default ActivationSection
