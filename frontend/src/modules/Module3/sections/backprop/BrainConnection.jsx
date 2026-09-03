import { useEffect, useRef, useState } from 'react'
import { useT } from '../../../../i18n/useT'

const NEUROCORRELATION_ARTICLE_URL = 'https://axelwickman.com/articles/neurocorrelation?utm_source=gh_neurocorrelation'
const NEUROCORRELATION_EMBED_URL = `${NEUROCORRELATION_ARTICLE_URL}#:~:text=Live%20App`
const LOCAL_NEUROCORRELATION_MODULE_PATH = `${import.meta.env.BASE_URL}vendor/neurocorrelation/index.mjs`
const NEUROCORRELATION_REPO_URL = 'https://github.com/Axelwickm/NeuroCorrelation'


function NeuroCorrelationPreview() {
  const t = useT()
  const canvasRef = useRef(null)
  const viewerRef = useRef(null)
  const mountedAppRef = useRef(null)
  const resizeObserverRef = useRef(null)
  const [availability, setAvailability] = useState('checking')
  const [state, setState] = useState('idle')

  useEffect(() => {
    let cancelled = false

    const checkLocalBuild = async () => {
      try {
        // Step 1 — fetch index.mjs and verify it is a real JS module
        const indexResponse = await fetch(LOCAL_NEUROCORRELATION_MODULE_PATH, {
          cache: 'no-store',
        })
        if (cancelled) return

        if (!indexResponse.ok) {
          setAvailability('live')
          setState('embedded-live')
          return
        }

        const indexBody = await indexResponse.text()
        if (cancelled) return

        const isRealModule = indexBody.includes('mountNeuroCorrelation')
          && indexBody.includes('neurocorrelation.mjs')
          && indexBody.length > 100

        if (!isRealModule) {
          // Got a response but it's the SPA fallback HTML, not the real module
          setAvailability('live')
          setState('embedded-live')
          return
        }

        // Step 2 — GET dist/neurocorrelation.mjs and verify it is real JS
        // HEAD is not sufficient — Vite SPA fallback returns 200 for all paths
        const distPath = LOCAL_NEUROCORRELATION_MODULE_PATH
          .replace('index.mjs', 'dist/neurocorrelation.mjs')

        const distResponse = await fetch(distPath, { cache: 'no-store' })
        if (cancelled) return

        if (!distResponse.ok) {
          setAvailability('live')
          setState('embedded-live')
          return
        }

        const distBody = await distResponse.text()
        if (cancelled) return

        // SPA fallback returns HTML — real dist file is JS
        // Check for JS content and minimum size (real wasm loader is >10KB)
        const distIsReal = (
          !distBody.trimStart().startsWith('<!') &&
          !distBody.trimStart().startsWith('<html') &&
          distBody.length > 10000
        )

        if (distIsReal) {
          setAvailability('local')
          return
        }

        // dist file is missing or is SPA HTML fallback
        setAvailability('live')
        setState('embedded-live')

      } catch (error) {
        if (cancelled) return
        console.error('NeuroCorrelation local availability check failed:', error)
        setAvailability('live')
        setState('embedded-live')
      }
    }

    checkLocalBuild()

    return () => {
      cancelled = true
      resizeObserverRef.current?.disconnect()
      mountedAppRef.current?.destroy?.()
    }
  }, [])

  const syncCanvasSize = () => {
    const canvas = canvasRef.current
    const viewer = viewerRef.current
    if (!canvas || !viewer) return

    const width = viewer.clientWidth
    const height = viewer.clientHeight
    if (width === 0 || height === 0) return

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
  }

  const handleStart = async () => {
    if (state === 'starting' || state === 'ready' || state === 'embedded-live') return

    if (availability !== 'local') {
      setState('embedded-live')
      return
    }

    try {
      setState('starting')

      const module = await import(/* @vite-ignore */ LOCAL_NEUROCORRELATION_MODULE_PATH)
      const mountNeuroCorrelation = module.default || module.mountNeuroCorrelation

      if (typeof mountNeuroCorrelation !== 'function') {
        throw new Error('Local NeuroCorrelation module does not export a mount function.')
      }

      syncCanvasSize()

      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = new ResizeObserver(syncCanvasSize)
      if (viewerRef.current) {
        resizeObserverRef.current.observe(viewerRef.current)
      }

      mountedAppRef.current?.destroy?.()
      mountedAppRef.current = await mountNeuroCorrelation({
        canvas: canvasRef.current,
        preset: 'STANDARD',
        print: (text) => console.log(text),
        printErr: (text) => console.error(text),
      })

      setState('ready')
    } catch (error) {
      console.error('NeuroCorrelation local mount failed:', error)
      setAvailability('live')
      setState('embedded-live')
    }
  }

  const showCanvas = state === 'ready'
  const showLiveFrame = state === 'embedded-live'
  const description = availability === 'local'
    ? t('module3.neuro.localBuild')
    : t('module3.neuro.webglBody')
  const buttonCopy = t('module3.neuro.localCopy')

  return (
    <div className="m3-brain-feedback__viewer" ref={viewerRef}>
      <canvas
        ref={canvasRef}
        className={`m3-brain-feedback__canvas${showCanvas ? ' is-active' : ''}`}
        aria-label={t('module3.neuro.simulationTitle')}
      />

      {showLiveFrame ? (
        <div className="m3-brain-feedback__linkout">
          <div className="m3-brain-feedback__linkout-body">
            <p className="m3-brain-feedback__fallback-tag">{t('module3.neuro.interactive')}</p>
            <h4>{t('module3.neuro.ownTab')}</h4>
            <p>{t('module3.neuro.webglBody')}</p>
            <ul className="m3-brain-feedback__fallback-list">
              <li>{t('module3.neuro.fireTogether')}</li>
              <li>{t('module3.neuro.uncorrelated')}</li>
              <li>{t('module3.neuro.watchNetwork')}</li>
            </ul>
          </div>
          <a
            href={NEUROCORRELATION_ARTICLE_URL}
            target="_blank"
            rel="noreferrer"
            className="m3-brain-feedback__linkout-btn"
          >
            {t('module3.neuro.openSimulation')}
          </a>
        </div>
      ) : null}

      {!showCanvas && !showLiveFrame ? (
        <div className="m3-brain-feedback__fallback" aria-label={t('module3.neuro.previewUnavailable')}>
          <p className="m3-brain-feedback__fallback-tag">{t('module3.neuro.preview')}</p>
          <h4>{availability === 'checking' ? t('module3.neuro.preparing') : t('module3.neuro.ready')}</h4>
          <p>{availability === 'checking' ? t('module3.neuro.checking') : description}</p>
          <ul className="m3-brain-feedback__fallback-list">
            <li>{t('module3.neuro.fireTogether')}</li>
            <li>{t('module3.neuro.uncorrelated')}</li>
            <li>{t('module3.neuro.biologicalContrast')}</li>
          </ul>

        </div>
      ) : null}

      <div className="m3-brain-feedback__control-dock">
        {availability === 'local' ? (
          <button
            type="button"
            className="m3-brain-feedback__launch"
            onClick={handleStart}
            disabled={state === 'starting' || state === 'ready'}
          >
            <span className="m3-brain-feedback__launch-label">
              {state === 'starting' ? t('module3.neuro.starting') : t('module3.neuro.startLocal')}
            </span>
            <span className="m3-brain-feedback__launch-copy">{buttonCopy}</span>
          </button>
        ) : availability === 'checking' ? (
          <div className="m3-brain-feedback__launch is-static">
            <span className="m3-brain-feedback__launch-label">{t('module3.neuro.checkingMode')}</span>
            <span className="m3-brain-feedback__launch-copy">{t('module3.neuro.localBuild')}</span>
          </div>
        ) : null}

        <a
          className="m3-btn"
          href={NEUROCORRELATION_ARTICLE_URL}
          target="_blank"
          rel="noreferrer"
        >
          {t('module3.neuro.fullArticle')}
        </a>
      </div>
    </div>
  )
}

function BrainConnection() {
  const t = useT()
  return (
    <section className="m3-section">
      <div className="m3-section-card m3-section-card--feature m3-brain-feedback">
        <div className="m3-section-heading">
          <p className="m3-eyebrow">{t('module3.neuro.eyebrow')}</p>
          <h2>{t('module3.neuro.title')}</h2>
          <p className="m3-section-subtitle">{t('module3.neuro.subtitle')}</p>
        </div>

        <div className="m3-brain-feedback__compare">
          <div className="m3-brain-feedback__compare-card">
            <p className="m3-brain-feedback__mini-label">{t('module3.neuro.aiModel')}</p>
            <strong>{t('module3.neuro.errorBackward')}</strong>
            <span>{t('module3.neuro.global')}</span>
          </div>
          <div className="m3-brain-feedback__compare-card">
            <p className="m3-brain-feedback__mini-label">{t('module3.neuro.brainModel')}</p>
            <strong>{t('module3.neuro.localTiming')}</strong>
            <span>{t('module3.neuro.noTeacher')}</span>
          </div>
        </div>

        <div className="m3-brain-feedback__visual">
          <div className="m3-brain-feedback__shell">
            <div className="m3-brain-feedback__shell-bar">
              <span /><span /><span />
              <p>{t('module3.neuro.simulationTitle')}</p>
            </div>
            <NeuroCorrelationPreview />
          </div>
          <p className="m3-source-note">
            {t('module3.neuro.simulationBy')} <a href={NEUROCORRELATION_REPO_URL} target="_blank" rel="noreferrer">Axel Wickman</a> —
            <a href={NEUROCORRELATION_ARTICLE_URL} target="_blank" rel="noreferrer"> {t('module3.neuro.fullArticleLower')}</a>
          </p>
        </div>

      </div>
    </section>
  )
}

export default BrainConnection
