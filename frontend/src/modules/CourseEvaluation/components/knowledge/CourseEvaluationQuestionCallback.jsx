import { useT } from '../../../../i18n/useT'

export default function CourseEvaluationQuestionCallback({ module, sectionTitle }) {
  const t = useT()

  return (
    <div className="ce-connects-strip" aria-label={`${t('postEval.connectsTo')} ${module} ${sectionTitle}`}>
      <span>{t('postEval.connectsTo')}</span>
      <strong>{module} · {sectionTitle}</strong>
    </div>
  )
}
