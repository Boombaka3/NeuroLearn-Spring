import digitFeatureImage from '../../../../assets/module3/digit/digit-4-ambiguous-9.png'
import { useT } from '../../../../i18n/useT'

const DIGIT_FEATURE_IMAGE = digitFeatureImage

function PredictionSummary({ prediction, target, status, improved = false }) {
  return (
    <div className={`m3-sa-prediction${improved ? ' m3-sa-prediction--improved' : ''}`}>
      <div>
        <span>{useT()('module3.prediction')}</span>
        <strong>{prediction}</strong>
      </div>
      <div>
        <span>{useT()('module3.target')}</span>
        <strong>{target}</strong>
      </div>
      <p>{status}</p>
    </div>
  )
}

function LearningProblem() {
  const t = useT()
  return (
    <section className="m3-section m3-section--centered">
      <div className="m3-section-card m3-section-card--feature m3-learning-problem-card m3-sa-card">
        <div className="m3-section-heading">
          <p className="m3-eyebrow">{t('module3.learningProblem.eyebrow')}</p>
          <h2>{t('module3.learningProblem.title')}</h2>
          <p className="m3-section-subtitle">{t('module3.learningProblem.subtitle')}</p>
        </div>

        <div className="m3-sa-layout">
          <article className="m3-sa-panel m3-sa-panel--input">
            <div className="m3-sa-panel-head">
              <h3>{t('module3.learningProblem.inputTitle')}</h3>
              <p>{t('module3.learningProblem.inputBody')}</p>
            </div>
            <div className="m3-sa-digit-frame">
              <img
                src={DIGIT_FEATURE_IMAGE}
                alt={t('module3.learningProblem.imageAlt')}
                className="m3-sa-digit-image"
              />
            </div>
            <p className="m3-sa-note">{t('module3.learningProblem.inputNote')}</p>
          </article>

          <article className="m3-sa-panel m3-sa-panel--before">
            <div className="m3-sa-panel-head">
              <h3>{t('module3.learningProblem.beforeTitle')}</h3>
              <p>{t('module3.learningProblem.wrongBody')}</p>
            </div>
            <PredictionSummary prediction="9" target="4" status={t('module3.learningProblem.error')} />
            <p className="m3-sa-note">
              {t('module3.learningProblem.beforeNote1')}
            </p>
            <p className="m3-sa-note">
              {t('module3.learningProblem.beforeNote2')}
            </p>
          </article>

          <div className="m3-sa-connector" aria-hidden="true">
            <span>{t('module3.learningProblem.feedback')}</span>
          </div>

          <article className="m3-sa-panel m3-sa-panel--after">
            <div className="m3-sa-panel-head">
              <h3>{t('module3.learningProblem.afterTitle')}</h3>
              <p>{t('module3.learningProblem.correctBody')}</p>
            </div>
            <PredictionSummary
              prediction="4"
              target="4"
              status={t('module3.learningProblem.improved')}
              improved
            />
            <p className="m3-sa-note">
              {t('module3.learningProblem.afterNote1')}
            </p>
            <p className="m3-sa-note">
              {t('module3.learningProblem.afterNote2')}
            </p>
          </article>
        </div>

        <p className="m3-section-takeaway m3-sa-takeaway">
          {t('module3.learningProblem.takeaway')}
        </p>
      </div>
    </section>
  )
}

export default LearningProblem
