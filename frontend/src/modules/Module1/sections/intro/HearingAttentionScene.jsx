import { useState } from 'react'
import { useT } from '../../../../i18n/useT'
import { eyesSvg, payAttentionSvg } from './module1SceneAssets'

function HearingAttentionScene() {
  const t = useT()
  const [showEyeScene, setShowEyeScene] = useState(false)
  const backgroundNoise = [
    { label: t('module1.intro.scene.noise.top'), className: 'module1-attention-noise--top' },
    { label: t('module1.intro.scene.noise.middle'), className: 'module1-attention-noise--middle' },
    { label: t('module1.intro.scene.noise.bottom'), className: 'module1-attention-noise--bottom' },
    { label: t('module1.intro.scene.noise.soft'), className: 'module1-attention-noise--soft' },
  ]

  return (
    <figure className="module1-attention-figure">
      <button
        type="button"
        className={`module1-scene-flipcard${showEyeScene ? ' is-flipped' : ''}`}
        onClick={() => setShowEyeScene((current) => !current)}
        aria-pressed={showEyeScene}
        aria-label={
          showEyeScene
            ? t('module1.intro.scene.flip.showHearing')
            : t('module1.intro.scene.flip.showEye')
        }
      >
        <span className="module1-scene-flipcard__inner">
          <span className="module1-scene-flipcard__face module1-scene-flipcard__face--front">
            <span
              className="module1-attention-scene"
              role="img"
              aria-label={t('module1.intro.scene.hearing.aria')}
            >
              <span
                className="module1-attention-scene__art"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: payAttentionSvg }}
              />

              <span className="module1-attention-noise-layer" aria-hidden="true">
                {backgroundNoise.map(({ label, className }) => (
                  <span key={`${label}-${className}`} className={`module1-attention-noise ${className}`}>
                    {label}
                  </span>
                ))}
              </span>

              <span className="module1-attention-signal" aria-hidden="true">
                <span className="module1-attention-signal__word-track">
                  <span className="module1-attention-signal__word">ALEX!</span>
                </span>
                <span className="module1-attention-signal__trail module1-attention-signal__trail--one" />
                <span className="module1-attention-signal__trail module1-attention-signal__trail--two" />
                <span className="module1-attention-signal__trail module1-attention-signal__trail--three" />
              </span>

              <span className="module1-attention-ear-focus" aria-hidden="true">
                <span className="module1-attention-ear-focus__ring module1-attention-ear-focus__ring--one" />
                <span className="module1-attention-ear-focus__ring module1-attention-ear-focus__ring--two" />
                <span className="module1-attention-ear-focus__dot" />
              </span>
            </span>
          </span>

          <span className="module1-scene-flipcard__face module1-scene-flipcard__face--back">
            <span
              className="module1-eye-scene"
              role="img"
              aria-label={t('module1.intro.scene.eye.aria')}
            >
              <span
                className="module1-eye-scene__art"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: eyesSvg }}
              />

              <span className="module1-eye-light-layer" aria-hidden="true">
                <span className="module1-eye-light-layer__source" />
                <span className="module1-eye-light-layer__beam" />
                <span className="module1-eye-light-layer__glow" />
              </span>
            </span>
          </span>
        </span>
      </button>

      <figcaption className="module1-attention-caption">
        {showEyeScene
          ? t('module1.intro.scene.caption.eye')
          : t('module1.intro.scene.caption.hearing')}
      </figcaption>
      <p className="module1-attention-attribution">
        <a href="https://storyset.com/people" target="_blank" rel="noreferrer">
          {t('module1.intro.scene.attribution')}
        </a>
      </p>
    </figure>
  )
}

export default HearingAttentionScene
