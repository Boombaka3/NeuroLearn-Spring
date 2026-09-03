const CNN_EXPLAINER_DEMO_URL = 'https://poloclub.github.io/cnn-explainer/'
const CNN_EXPLAINER_REPO_URL = 'https://github.com/poloclub/cnn-explainer'
import { useT } from '../../../../i18n/useT'

function CnnExplainerSection() {
  const t = useT()
  return (
    <section className="m2-section">
      <div className="m2-section-card m2-explainer-card">
        <div className="m2-section-heading m2-canvas-heading">
          <p className="m2-eyebrow">{t('module2.explainer.eyebrow')}</p>
          <h2>{t('module2.explainer.title')}</h2>
          <p className="m2-section-subtitle">
            {t('module2.explainer.subtitle')}
          </p>
        </div>

        <div className="m2-explainer-row">
          <div className="m2-explainer-linkout">
            <div className="m2-explainer-linkout__body">
              <p className="m2-explainer-linkout__tag">{t('module2.explainer.tag')}</p>
              <h3 className="m2-explainer-linkout__title">
                {t('module2.explainer.cardTitle')}
              </h3>
              <p className="m2-explainer-linkout__desc">
                {t('module2.explainer.description')}
              </p>
            </div>

            <a
              href={CNN_EXPLAINER_DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="m2-explainer-linkout__btn"
            >
              {t('module2.explainer.open')}
            </a>
          </div>

          <div className="m2-explainer-intro">
            <p className="m2-explainer-intro__label">{t('module2.explainer.lookFor')}</p>
            <ul className="m2-explainer-intro__list">
              <li>{t('module2.explainer.edgePatterns')}</li>
              <li>{t('module2.explainer.pooling')}</li>
              <li>{t('module2.explainer.features')}</li>
            </ul>
          </div>
        </div>

        <p className="m2-source-note">
          Source:{' '}
          <a
            href={CNN_EXPLAINER_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            poloclub/cnn-explainer on GitHub
          </a>
        </p>
      </div>
    </section>
  )
}

export default CnnExplainerSection
