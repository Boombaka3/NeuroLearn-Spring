import { useAppSelector } from '../store/hooks'
import { selectLang } from '../store/language'
import { strings } from './strings'

export function useT() {
  const lang = useAppSelector(selectLang)

  return (key: string, replacements?: Record<string, string | number>) => {
    const template = strings[lang][key] ?? strings.en[key] ?? key

    if (!replacements) {
      return template
    }

    return Object.entries(replacements).reduce(
      (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
      template,
    )
  }
}
