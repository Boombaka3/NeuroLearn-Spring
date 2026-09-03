import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectLang, setLang } from '../../store/language'
import type { Lang } from '../../types/app'

function getHashForLang(lang: Lang) {
  return `#/${lang}`
}

export default function LanguageToggle() {
  const dispatch = useAppDispatch()
  const lang = useAppSelector(selectLang)

  const handleSelect = (nextLang: Lang) => {
    if (lang === nextLang && window.location.hash === getHashForLang(nextLang)) {
      return
    }

    dispatch(setLang(nextLang))

    if (window.location.hash !== getHashForLang(nextLang)) {
      window.location.hash = `/${nextLang}`
    }
  }

  return (
    <div className="mnav-language-toggle" role="group" aria-label="Language toggle">
      <button
        type="button"
        className={`mnav-language-toggle__button${lang === 'en' ? ' is-active' : ''}`}
        onClick={() => handleSelect('en')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <span className="mnav-language-toggle__divider" aria-hidden="true">
        |
      </span>
      <button
        type="button"
        className={`mnav-language-toggle__button${lang === 'zh' ? ' is-active' : ''}`}
        onClick={() => handleSelect('zh')}
        aria-pressed={lang === 'zh'}
      >
        中文
      </button>
    </div>
  )
}
