import hubelWieselImage from '../../../../assets/module2/selectivity/hubel-wiesel-selectivity.png'
import { useT } from '../../../../i18n/useT'

export default function HubelWieselStory() {
  const t = useT()
  return (
    <article className="m2-hw-card">
      <div className="m2-hw-copy">
        <h3>{t('module2.selectivity.experimentTitle')}</h3>
        <p>
          {t('module2.selectivity.experimentBody1')}
        </p>
        <p>
          {t('module2.selectivity.experimentBody2')}
        </p>
        <p className="m2-source-note">
          {t('module2.selectivity.reference')}{' '}
          <a
            href="https://doi.org/10.1113/jphysiol.1959.sp006308"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hubel & Wiesel, 1959
          </a>
        </p>
      </div>

      <figure className="m2-hw-figure">
        <img
          src={hubelWieselImage}
          alt={t('module2.selectivity.figureAlt')}
          loading="eager"
        />
        <figcaption>
          {t('module2.selectivity.figureCaption')}
          {' '}Source:{' '}
          <a href="https://doi.org/10.3390/brainsci12040470" target="_blank" rel="noreferrer">
            Li, Todo, and Tang (Brain Sciences, 2022)
          </a>
        </figcaption>
      </figure>
    </article>
  )
}
