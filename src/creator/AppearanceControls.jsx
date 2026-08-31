import { useEffect, useState } from 'react'

const GRADIENTS = [
  ['Dorado', 'linear-gradient(135deg, #8b6f47, #c9a86a, #f4efe8)'],
  ['Atardecer', 'linear-gradient(135deg, #7c3aed, #b76e79, #c9a86a)'],
  ['Romántico', 'linear-gradient(135deg, #8f5f6d, #d8b4a0, #f4efe8)'],
  ['Océano', 'linear-gradient(135deg, #071b35, #1d4e68, #6ea7b8)'],
  ['Salvia', 'linear-gradient(135deg, #34463d, #879b8e, #d5ded8)'],
  ['Marfil', 'linear-gradient(135deg, #d8d0c2, #f4efe8, #fffdf8)'],
  ['Noche', 'linear-gradient(135deg, #05070d, #111827, #374151)'],
  ['Cielo', 'linear-gradient(135deg, #172554, #2563eb, #93c5fd)'],
  ['Borgoña', 'linear-gradient(135deg, #350d19, #7f1d35, #d6a0a8)'],
  ['Arena', 'linear-gradient(135deg, #8c6b4f, #c7a77a, #f2e1c4)'],
]

const DEFAULT_GRADIENT = GRADIENTS[0][1]
const HEX_RE = /^#[0-9a-fA-F]{6}$/
const gradientColors = (value) => (value || '').match(/#[0-9a-fA-F]{6}/g) || []
const safeColor = (value) => HEX_RE.test(String(value || '')) ? String(value) : '#ffffff'
const safeGradient = (value) => typeof value === 'string' && value.includes('gradient(') && gradientColors(value).length >= 2 ? value : ''

function ColorPicker({ value, onChange }) {
  const normalized = safeColor(value)
  const [draft, setDraft] = useState(normalized)

  useEffect(() => setDraft(normalized), [normalized])

  const commit = (next) => {
    const raw = String(next || '').trim()
    setDraft(raw)
    if (HEX_RE.test(raw)) onChange(raw.toLowerCase())
  }

  const blur = () => {
    if (!HEX_RE.test(draft)) setDraft(normalized)
  }

  return (
    <div className="appearance-color-editor">
      <div className="appearance-color-picker-wrap">
        <input className="appearance-color-picker" type="color" value={normalized} onChange={(e) => commit(e.target.value)} />
        <span>Elegir cualquier color</span>
      </div>
      <input className="appearance-hex-input" value={draft} onChange={(e) => commit(e.target.value)} onBlur={blur} placeholder="#FFFFFF" maxLength={7} spellCheck="false" />
    </div>
  )
}

function GradientBuilder({ value, onChange }) {
  const readValue = (input) => {
    const gradient = safeGradient(input)
    const colors = gradientColors(gradient)
    const radial = gradient.startsWith('radial-gradient')
    const angleMatch = gradient.match(/linear-gradient\(\s*(-?\d+(?:\.\d+)?)deg/i)
    return {
      colors: colors.length >= 2 ? colors : gradientColors(DEFAULT_GRADIENT),
      type: radial ? 'radial' : 'linear',
      angle: angleMatch ? angleMatch[1] : '135',
    }
  }

  const initial = readValue(value)
  const [colors, setColors] = useState(initial.colors)
  const [type, setType] = useState(initial.type)
  const [angle, setAngle] = useState(initial.angle)

  useEffect(() => {
    const next = readValue(value)
    setColors(next.colors)
    setType(next.type)
    setAngle(next.angle)
  }, [value])

  const sync = (nextColors, nextType = type, nextAngle = angle) => {
    const validColors = nextColors.map(safeColor)
    setColors(validColors)
    const nextGradient = nextType === 'linear'
      ? `linear-gradient(${nextAngle}deg, ${validColors.join(', ')})`
      : `radial-gradient(${validColors.join(', ')})`
    onChange(nextGradient)
  }

  return (
    <div className="appearance-gradient-builder">
      <label>Tipo<select value={type} onChange={(e) => { const next = e.target.value; setType(next); sync(colors, next) }}><option value="linear">Lineal</option><option value="radial">Radial</option></select></label>
      {type === 'linear' && <label>Dirección<select value={angle} onChange={(e) => { const next = e.target.value; setAngle(next); sync(colors, type, next) }}><option value="0">→</option><option value="45">↗</option><option value="90">↑</option><option value="135">↖</option><option value="180">←</option><option value="225">↙</option><option value="270">↓</option><option value="315">↘</option></select></label>}
      <div className="appearance-gradient-preview" style={{ background: safeGradient(value) || DEFAULT_GRADIENT }} />
      {colors.map((color, index) => (
        <div className="appearance-gradient-stop" key={`${index}-${color}`}>
          <input type="color" value={safeColor(color)} onChange={(e) => { const next = [...colors]; next[index] = e.target.value; sync(next) }} />
          <input value={color} maxLength={7} onChange={(e) => { const raw = e.target.value; const next = [...colors]; if (HEX_RE.test(raw)) { next[index] = raw.toLowerCase(); sync(next) } }} />
          <button type="button" disabled={colors.length <= 2} onClick={() => sync(colors.filter((_, i) => i !== index))}>×</button>
        </div>
      ))}
      <button type="button" className="appearance-add-color" onClick={() => sync([...colors, '#ffffff'])}>+ Agregar color</button>
      <div className="appearance-gradient-list">
        {GRADIENTS.map(([name, gradient]) => (
          <button key={name} type="button" className="appearance-gradient" style={{ background: gradient }} onClick={() => { setColors(gradientColors(gradient)); setType('linear'); setAngle('135'); onChange(gradient) }}><span>{name}</span></button>
        ))}
      </div>
    </div>
  )
}

function BackgroundControls({ appearance, set }) {
  const mode = appearance.backgroundMode || 'solid'
  const color = safeColor(appearance.backgroundColor || '#0b1730')
  const gradient = safeGradient(appearance.backgroundGradient || '')
  const activeGradient = gradient || DEFAULT_GRADIENT

  const useGradient = () => {
    set('appearance.backgroundGradient', activeGradient)
    set('appearance.backgroundMode', 'gradient')
  }

  const texture = String(appearance.backgroundTextureImage || '').trim()
  const textureEnabled = appearance.backgroundTextureType === 'image'
  const textureOpacity = Number.isFinite(Number(appearance.backgroundTextureOpacity)) ? Number(appearance.backgroundTextureOpacity) : 0.28
  const textureBlend = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light'].includes(appearance.backgroundTextureBlend) ? appearance.backgroundTextureBlend : 'soft-light'

  const updateTextureUrl = (value) => {
    const next = String(value || '').trim()
    set('appearance.backgroundTextureImage', value)
    set('appearance.backgroundTextureType', next ? 'image' : 'none')
  }

  return (
    <section className="appearance-dropdown">
      <button type="button" className="appearance-dropdown-summary" onClick={() => set('appearance.__openBackground', !appearance.__openBackground)} aria-expanded={Boolean(appearance.__openBackground)}>
        <strong>Fondo</strong>
        <span className="appearance-current" style={{ background: mode === 'gradient' ? activeGradient : color }} />
        <span>{mode === 'gradient' ? 'Degradado' : color}</span>
        <b>⌄</b>
      </button>
      {appearance.__openBackground && (
        <div className="appearance-dropdown-content">
          <div className="appearance-style-switch">
            <button type="button" className={mode === 'solid' ? 'active' : ''} onClick={() => set('appearance.backgroundMode', 'solid')}>Color</button>
            <button type="button" className={mode === 'gradient' ? 'active' : ''} onClick={useGradient}>Degradado</button>
          </div>

          {mode === 'gradient' ? (
            <GradientBuilder value={activeGradient} onChange={(value) => { set('appearance.backgroundGradient', value); set('appearance.backgroundMode', 'gradient') }} />
          ) : (
            <ColorPicker value={color} onChange={(value) => { set('appearance.backgroundColor', value); set('appearance.backgroundMode', 'solid') }} />
          )}

          <section className="appearance-texture-controls">
            <div className="appearance-texture-header">
              <strong>Textura fotográfica</strong>
              <small>La imagen cubre todo el fondo en dispositivos móviles, centrada y con zoom automático.</small>
            </div>
            <label className="appearance-texture-toggle">
              <input type="checkbox" checked={textureEnabled} onChange={(e) => set('appearance.backgroundTextureType', e.target.checked ? 'image' : 'none')} />
              <span>Usar textura</span>
            </label>
            {textureEnabled && (
              <>
                <label>URL de la textura<input type="url" value={texture} onChange={(e) => updateTextureUrl(e.target.value)} placeholder="https://.../textura.jpg" /></label>
                <label>Opacidad<input type="range" min="0" max="1" step="0.01" value={textureOpacity} onChange={(e) => set('appearance.backgroundTextureOpacity', Number(e.target.value))} /><small>{Math.round(textureOpacity * 100)}%</small></label>
                <label>Modo de mezcla<select value={textureBlend} onChange={(e) => set('appearance.backgroundTextureBlend', e.target.value)}><option value="normal">Normal</option><option value="multiply">Multiply</option><option value="screen">Screen</option><option value="overlay">Overlay</option><option value="soft-light">Soft Light</option><option value="hard-light">Hard Light</option></select></label>
              </>
            )}
          </section>
        </div>
      )}
    </section>
  )
}

function Typography({ project, set, open, onToggle }) {
  return (
    <section className="appearance-dropdown">
      <button type="button" className="appearance-dropdown-summary" onClick={() => onToggle('typography')} aria-expanded={open}>
        <strong>Texto y tipografía</strong>
        <span>Sin elementos configurables</span>
        <b>⌄</b>
      </button>
      {open && (
        <div className="appearance-dropdown-content">
          <div className="appearance-empty-type-items">
            <strong>Sin elementos configurados</strong>
            <small>Los textos visibles de la invitación permanecen intactos. Iremos agregando cada texto y asignándolo a un elemento desde cero.</small>
          </div>
        </div>
      )}
    </section>
  )
}

export default function AppearanceControls({ project, set }) {
  const [open, setOpen] = useState(null)
  const appearance = project.appearance || {}
  const toggle = (id) => setOpen((current) => current === id ? null : id)

  return (
    <div className="appearance-editor">
      <label className="editor-field">
        <span>Nombre del proyecto</span>
        <input value={project.name || ''} onChange={(e) => set('name', e.target.value)} />
      </label>
      <div className="appearance-card">
        <strong>Apariencia</strong>
        <small>Configuración visual del proyecto.</small>
        <BackgroundControls appearance={appearance} set={set} />
        <Typography project={project} set={set} open={open === 'typography'} onToggle={toggle} />
      </div>
    </div>
  )
}
