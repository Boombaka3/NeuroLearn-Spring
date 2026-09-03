import { useT } from '../../i18n/useT'

function AnnDiagram({ isMobile = false, variant = 'default', activeBridgePart = 'inputs' }) {
  const t = useT()
  const isBridge = variant === 'bridge'
  const width = isBridge || isMobile ? '100%' : 800
  const viewBox = isBridge ? '0 0 620 280' : '0 0 800 300'
  const ariaLabel = isBridge ? t('module1.bridge.diagram.aria') : 'Artificial neuron diagram'
  const activationCheckX = 388
  const activationCheckWidth = 80
  const activationCheckRightEdge = activationCheckX + activationCheckWidth
  const outputConnectionStartX = 508
  const outputLabelX = (activationCheckRightEdge + outputConnectionStartX) / 2 + 8

  return (
    <div className={`ann-diagram-shell ${isBridge ? 'ann-diagram-shell--bridge' : ''}`}>
      <svg width={width} viewBox={viewBox} role="img" aria-label={ariaLabel} className="ann-diagram-svg">
        {!isBridge && <rect x="0" y="0" width="800" height="300" rx="18" fill="#F8FAFC" />}

        {isBridge ? (
          <>
            <defs>
              <marker id="ann-bridge-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#c7d2fe" />
              </marker>
            </defs>

            <g className={activeBridgePart ? 'bridge-svg--has-highlight' : ''} opacity="1">
              <g className={`bridge-ann__inputs${activeBridgePart === 'inputs' ? ' bridge-part--active' : ''}`}>
                <line x1="92" y1="48" x2="268" y2="140" stroke="#818cf8" strokeWidth="4.5" />
                <line x1="92" y1="140" x2="268" y2="140" stroke="#a5b4fc" strokeWidth="2.5" />
                <line x1="92" y1="232" x2="268" y2="140" stroke="#c7d2fe" strokeWidth="1.5" />

                <text x="180" y="83" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill="#1d4ed8">w1</text>
                <text x="180" y="132" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill="#1d4ed8">w2</text>
                <text x="180" y="178" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill="#1d4ed8">w3</text>

                <g>
                  <circle cx="64" cy="48" r="24" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2.5" />
                  <text x="64" y="54" textAnchor="middle" fontSize="14" fill="#1d4ed8" fontWeight="700">x1</text>
                </g>

                <g>
                  <circle cx="64" cy="140" r="24" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2.5" />
                  <text x="64" y="146" textAnchor="middle" fontSize="14" fill="#1d4ed8" fontWeight="700">x2</text>
                </g>

                <g>
                  <circle cx="64" cy="232" r="24" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2.5" />
                  <text x="64" y="238" textAnchor="middle" fontSize="14" fill="#1d4ed8" fontWeight="700">x3</text>
                </g>
              </g>

              <g className={`bridge-ann__node${activeBridgePart === 'combine' ? ' bridge-part--active' : ''}`}>
                <circle cx="320" cy="140" r="40" fill="#f3e8ff" stroke="#7c3aed" strokeWidth="3" />
                <text x="320" y="148" textAnchor="middle" fontSize="18" fill="#6d28d9" fontWeight="700">n</text>
              </g>

              <g className={`bridge-ann__output${activeBridgePart === 'output' ? ' bridge-part--active' : ''}`}>
                <line x1="360" y1="140" x2="388" y2="140" stroke="#c7d2fe" strokeWidth="2.4" />
                <line x1={activationCheckRightEdge} y1="140" x2={outputConnectionStartX} y2="140" stroke="#c7d2fe" strokeWidth="2.4" markerEnd="url(#ann-bridge-arrow)" />
                <text x={outputLabelX} y="116" textAnchor="middle" fontSize="14" fill="#4b5563" fontWeight="700">{t('module1.bridge.diagram.output')}</text>
              </g>

              <g className={`bridge-ann__activation${activeBridgePart === 'combine' ? ' bridge-part--active' : ''}`}>
                <rect x={activationCheckX} y="114" width={activationCheckWidth} height="52" rx="8" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2.4" />
                <text textAnchor="middle" fontSize="10" fill="#1d4ed8" fontWeight="700">
                  <tspan x="428" y="143">{t('module1.bridge.diagram.activation')}</tspan>
                </text>
              </g>

              <g className={`bridge-ann__connection${activeBridgePart === 'connection' ? ' bridge-part--active' : ''}`}>
                <line x1="508" y1="140" x2="576" y2="140" stroke="#99aeca" strokeWidth="2.1" />
                <circle cx="596" cy="140" r="12" fill="#ffffff" stroke="#94a3b8" strokeWidth="2.4" />
              </g>
            </g>
          </>
        ) : (
          <>
            <g className="ann-diagram__wires">
              <line x1="90" y1="90" x2="280" y2="128" />
              <line x1="90" y1="145" x2="280" y2="145" />
              <line x1="90" y1="200" x2="280" y2="162" />
              <line x1="90" y1="255" x2="280" y2="179" />
            </g>

            <g className="ann-diagram__node">
              <circle cx="380" cy="153" r="74" />
              <text x="380" y="165" textAnchor="middle">Σ</text>
            </g>

            <g className="ann-diagram__wires">
              <line x1="454" y1="153" x2="690" y2="153" />
            </g>

            <g className="ann-diagram__labels">
              <text x="120" y="62">inputs</text>
              <text x="380" y="58" textAnchor="middle">summation</text>
              <text x="694" y="136" textAnchor="end">output</text>
            </g>
          </>
        )}
      </svg>
    </div>
  )
}

export default AnnDiagram
