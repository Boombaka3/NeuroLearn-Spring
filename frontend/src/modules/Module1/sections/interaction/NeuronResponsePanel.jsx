import { useT } from '../../../../i18n/useT'

function NeuronResponsePanel({ lastResult }) {
  const t = useT()

  if (lastResult === 'no-fire') {
    return (
      <div className="module1-sound-neuron__response-panel">
        <span className="module1-sound-neuron__response-label">{t('module1.sound.response.label.result')}</span>
        <strong className="module1-sound-neuron__response-title">{t('module1.sound.response.noFire.title')}</strong>
        <span className="module1-sound-neuron__response-label">{t('module1.sound.response.label.why')}</span>
        <p className="module1-sound-neuron__response-line">{t('module1.sound.response.noFire.body')}</p>
      </div>
    )
  }

  if (lastResult === 'alex-fire') {
    return (
      <div className="module1-sound-neuron__response-panel">
        <span className="module1-sound-neuron__response-label">{t('module1.sound.response.label.result')}</span>
        <strong className="module1-sound-neuron__response-title">{t('module1.sound.response.fire.title')}</strong>
        <span className="module1-sound-neuron__response-label">{t('module1.sound.response.label.why')}</span>
        <p className="module1-sound-neuron__response-line">{t('module1.sound.response.fire.body')}</p>
      </div>
    )
  }

  if (lastResult === 'fire') {
    return (
      <div className="module1-sound-neuron__response-panel">
        <span className="module1-sound-neuron__response-label">{t('module1.sound.response.label.result')}</span>
        <strong className="module1-sound-neuron__response-title">{t('module1.sound.response.fire.title')}</strong>
        <span className="module1-sound-neuron__response-label">{t('module1.sound.response.label.why')}</span>
        <p className="module1-sound-neuron__response-line">{t('module1.sound.response.fire.body')}</p>
      </div>
    )
  }

  return (
    <div className="module1-sound-neuron__response-panel">
      <span className="module1-sound-neuron__response-label">{t('module1.sound.response.label.result')}</span>
      <strong className="module1-sound-neuron__response-title">{t('module1.sound.response.idle.title')}</strong>
      <span className="module1-sound-neuron__response-label">{t('module1.sound.response.label.why')}</span>
      <p className="module1-sound-neuron__response-line">{t('module1.sound.response.idle.body')}</p>
    </div>
  )
}

export default NeuronResponsePanel
