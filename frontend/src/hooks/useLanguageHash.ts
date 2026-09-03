import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectLang, setLang } from '../store/language'

function getLangFromHash() {
  if (typeof window === 'undefined') {
    return 'en' as const
  }

  return window.location.hash.includes('zh') ? 'zh' : 'en'
}

export default function useLanguageHash() {
  const dispatch = useAppDispatch()
  const lang = useAppSelector(selectLang)
  const shouldSkipNextWriteRef = useRef(true)

  useEffect(() => {
    const syncFromHash = () => {
      shouldSkipNextWriteRef.current = true
      dispatch(setLang(getLangFromHash()))
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)

    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [dispatch])

  useEffect(() => {
    if (shouldSkipNextWriteRef.current) {
      shouldSkipNextWriteRef.current = false
      return
    }

    const nextHash = `#/${lang}`
    if (window.location.hash && window.location.hash !== nextHash) {
      window.location.hash = `/${lang}`
    }
  }, [lang])
}
