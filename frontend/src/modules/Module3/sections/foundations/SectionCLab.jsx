import TrainingLab from './TrainingLab'
import { useT } from '../../../../i18n/useT'

function SectionCLab() {
  const t = useT()
  return (
    <section className="m3-section">
      <div className="m3-section-card m3-section-card--feature m3-section-shell">
        <div className="m3-section-heading">
          <p className="m3-eyebrow">{t('module3.sectionD.eyebrow')}</p>
          <h2>{t('module3.sectionD.title')}</h2>
          <p className="m3-section-subtitle">{t('module3.sectionD.subtitle')}</p>
        </div>
        <TrainingLab />
      </div>
    </section>
  )
}

export default SectionCLab
