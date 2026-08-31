import { useEffect, useState } from 'react'

const FONTS = [
  ['Playfair Display', "'Playfair Display', serif"], ['Cormorant Garamond', "'Cormorant Garamond', serif"], ['Lora', "'Lora', serif"], ['Libre Baskerville', "'Libre Baskerville', serif"], ['Montserrat', "'Montserrat', sans-serif"], ['Poppins', "'Poppins', sans-serif"], ['Cinzel', "'Cinzel', serif"], ['Great Vibes', "'Great Vibes', cursive"], ['Amoresa', "'Amoresa', cursive"], ['Georgia', 'Georgia, serif'], ['Arial', 'Arial, sans-serif'],
]
const GRADIENTS = [
  ['Dorado', 'linear-gradient(135deg, #8b6f47, #c9a86a, #f4efe8)'], ['Atardecer', 'linear-gradient(135deg, #7c3aed, #b76e79, #c9a86a)'], ['Romántico', 'linear-gradient(135deg, #8f5f6d, #d8b4a0, #f4efe8)'], ['Océano', 'linear-gradient(135deg, #071b35, #1d4e68, #6ea7b8)'], ['Salvia', 'linear-gradient(135deg, #34463d, #879b8e, #d5ded8)'], ['Marfil', 'linear-gradient(135deg, #d8d0c2, #f4efe8, #fffdf8)'], ['Noche', 'linear-gradient(135deg, #05070d, #111827, #374151)'], ['Cielo', 'linear-gradient(135deg, #172554, #2563eb, #93c5fd)'], ['Borgoña', 'linear-gradient(135deg, #350d19, #7f1d35, #d6a0a8)'], ['Arena', 'linear-gradient(135deg, #8c6b4f, #c7a77a, #f2e1c4)'],
]
const DEFAULT_GRADIENT = GRADIENTS[0][1]
// Se dejan temporalmente sin elementos. Los textos visibles de la invitación
// permanecen intactos; aquí iremos clasificándolos uno por uno desde cero.
const TYPE_ITEMS = []
const DEFAULTS = {
  title: { fontFamily: FONTS[0][1], fontSize: 42, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 500, lineHeight: 1.08, letterSpacing: 0 }, subtitle: { fontFamily: FONTS[0][1], fontSize: 16, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 }, paragraph: { fontFamily: FONTS[0][1], fontSize: 16, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 400, lineHeight: 1.7, letterSpacing: 0 }, sectionTitle: { fontFamily: FONTS[0][1], fontSize: 32, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 500, lineHeight: 1.15, letterSpacing: 0 }, label: { fontFamily: FONTS[9][1], fontSize: 11, color: '#c9a86a', mode: 'solid', gradient: '', fontWeight: 700, lineHeight: 1.4, letterSpacing: 2 }, small: { fontFamily: FONTS[9][1], fontSize: 12, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 }, button: { fontFamily: FONTS[9][1], fontSize: 13, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 600, lineHeight: 1.2, letterSpacing: 0.5 },
}
const HEX_RE = /^#[0-9a-fA-F]{6}$/
const gradientColors = value => (value || '').match(/#[0-9a-fA-F]{6}/g) || []
const safeColor = value => HEX_RE.test(String(value || '')) ? String(value) : '#ffffff'
const safeGradient = value => typeof value === 'string' && value.includes('gradient(') && gradientColors(value).length >= 2 ? value : ''
const paint = value => value.mode === 'gradient' && safeGradient(value.gradient) ? safeGradient(value.gradient) : safeColor(value.color)

function ColorPicker({ value, onChange }) {
  const normalized = safeColor(value)
  const [draft, setDraft] = useState(normalized)

  useEffect(() => {
    setDraft(normalized)
  }, [normalized])

  const commit = next => {
    const raw = String(next || '').trim()
    setDraft(raw)
    if (HEX_RE.test(raw)) onChange(raw.toLowerCase())
  }

  const blur = () => {
    if (!HEX_RE.test(draft)) setDraft(normalized)
  }

  return <div className="appearance-color-editor">
    <div className="appearance-color-picker-wrap">
      <input className="appearance-color-picker" type="color" value={normalized} onChange={e => commit(e.target.value)} />
      <span>Elegir cualquier color</span>
    </div>
    <input className="appearance-hex-input" value={draft} onChange={e => commit(e.target.value)} onBlur={blur} placeholder="#FFFFFF" maxLength={7} spellCheck="false" />
  </div>
}

function GradientBuilder({ value, onChange }) {
  const readValue = value => {
    const gradient = safeGradient(value)
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
    onChange(nextType === 'linear' ? `linear-gradient(${nextAngle}deg, ${validColors.join(', ')})` : `radial-gradient(${validColors.join(', ')})`)
  }

  return <div className="appearance-gradient-builder">
    <label>Tipo<select value={type} onChange={e => { const next = e.target.value; setType(next); sync(colors, next) }}><option value="linear">Lineal</option><option value="radial">Radial</option></select></label>
    {type === 'linear' && <label>Dirección<select value={angle} onChange={e => { const next = e.target.value; setAngle(next); sync(colors, type, next) }}><option value="0">→</option><option value="45">↗</option><option value="90">↑</option><option value="135">↖</option><option value="180">←</option><option value="225">↙</option><option value="270">↓</option><option value="315">↘</option></select></label>}
    <div className="appearance-gradient-preview" style={{ background: safeGradient(value) || DEFAULT_GRADIENT }} />
    {colors.map((color, index) => <div className="appearance-gradient-stop" key={`${index}-${color}`}><input type="color" value={safeColor(color)} onChange={e => { const next = [...colors]; next[index] = e.target.value; sync(next) }} /><input value={color} maxLength={7} onChange={e => { const raw = e.target.value; const next = [...colors]; next[index] = HEX_RE.test(raw) ? raw.toLowerCase() : color; if (HEX_RE.test(raw)) sync(next) }} /><button type="button" disabled={colors.length <= 2} onClick={() => sync(colors.filter((_, i) => i !== index))}>×</button></div>)}
    <button type="button" className="appearance-add-color" onClick={() => sync([...colors, '#ffffff'])}>+ Agregar color</button>
    <div className="appearance-gradient-list">{GRADIENTS.map(([name, gradient]) => <button key={name} type="button" className="appearance-gradient" style={{ background: gradient }} onClick={() => { setColors(gradientColors(gradient)); setType('linear'); setAngle('135'); onChange(gradient) }}><span>{name}</span></button>)}</div>
  </div>
}

function TextureControls({ appearance, set }) {
  const enabled = appearance.backgroundTextureType === 'image'
  const image = appearance.backgroundTextureImage || ''
  const opacity = Number.isFinite(Number(appearance.backgroundTextureOpacity)) ? Number(appearance.backgroundTextureOpacity) : 0.28
  return <section className="appearance-texture-controls">
    <div className="appearance-texture-header"><strong>Textura fotográfica</strong><small>La imagen cubrirá toda la pantalla, centrada y con zoom automático.</small></div>
    <label className="appearance-texture-toggle"><input type="checkbox" checked={enabled} onChange={e => set('appearance.backgroundTextureType', e.target.checked ? 'image' : 'none')} /><span>Usar textura</span></label>
    {enabled && <>
      <label>URL de la textura<input type="url" value={image} onChange={e => set('appearance.backgroundTextureImage', e.target.value)} placeholder="https://.../textura.jpg" /></label>
      <small className="appearance-texture-status">{image ? 'Textura configurada. Se actualizará automáticamente.' : 'Pega una URL directa de una imagen JPG, PNG o WebP.'}</small>
      <label>Opacidad<input type="range" min="0" max="1" step="0.01" value={opacity} onChange={e => set('appearance.backgroundTextureOpacity', Number(e.target.value))} /><small>{Math.round(opacity * 100)}%</small></label>
      <label>Modo de mezcla<select value={appearance.backgroundTextureBlend || 'soft-light'} onChange={e => set('appearance.backgroundTextureBlend', e.target.value)}><option value="normal">Normal</option><option value="multiply">Multiply</option><option value="screen">Screen</option><option value="overlay">Overlay</option><option value="soft-light">Soft Light</option><option value="hard-light">Hard Light</option></select></label>
      <div className="appearance-texture-preview" style={{ backgroundColor: appearance.backgroundColor || '#0b1730', backgroundImage: appearance.backgroundMode === 'gradient' && appearance.backgroundGradient && image ? `${appearance.backgroundGradient}, url(${JSON.stringify(image)})` : image ? `url(${JSON.stringify(image)})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundBlendMode: appearance.backgroundTextureBlend || 'soft-light' }} />
    </>}
  </section>
}

function BaseStyle({ id, title, appearance, set, open, onToggle }) {
  const mode = appearance[`${id}Mode`] || 'solid'
  const color = safeColor(appearance[`${id}Color`] || '#ffffff')
  const gradient = safeGradient(appearance[`${id}Gradient`] || '')
  const isGradient = mode === 'gradient' && Boolean(gradient)
  const preview = isGradient ? gradient : color
  const activateGradient = () => {
    set(`appearance.${id}Gradient`, gradient || DEFAULT_GRADIENT)
    set(`appearance.${id}Mode`, 'gradient')
  }
  return <section className="appearance-dropdown"><button type="button" className="appearance-dropdown-summary" onClick={() => onToggle(id)} aria-expanded={open}><strong>{title}</strong><span className="appearance-current" style={{ background: preview }} /><span>{isGradient ? 'Degradado' : color}</span><b>⌄</b></button>{open && <div className="appearance-dropdown-content"><div className="appearance-style-switch"><button type="button" className={mode === 'solid' ? 'active' : ''} onClick={() => set(`appearance.${id}Mode`, 'solid')}>Color</button><button type="button" className={mode === 'gradient' ? 'active' : ''} onClick={activateGradient}>Degradado</button></div>{mode === 'gradient' ? <GradientBuilder value={gradient || DEFAULT_GRADIENT} onChange={value => { set(`appearance.${id}Gradient`, value); set(`appearance.${id}Mode`, 'gradient') }} /> : <ColorPicker value={color} onChange={value => { set(`appearance.${id}Color`, value); set(`appearance.${id}Mode`, 'solid') }} />}</div>}</section>
}

function Typography({ project, set, open, onToggle }) {
  const [item, setItem] = useState('title')
  const appearance = project.appearance || {}
  const current = { ...DEFAULTS[item], ...(appearance.typography?.[item] || {}) }
  const currentGradient = safeGradient(current.gradient)
  const previewGradient = current.mode === 'gradient'
  const currentColor = safeColor(current.color)
  const write = (key, value) => set(`appearance.typography.${item}.${key}`, value)
  const activateGradient = () => {
    write('gradient', currentGradient || DEFAULT_GRADIENT)
    write('mode', 'gradient')
  }
  const liveGradient = currentGradient || DEFAULT_GRADIENT

  return <section className="appearance-dropdown"><button type="button" className="appearance-dropdown-summary" onClick={() => onToggle('typography')} aria-expanded={open}><strong>Texto y tipografía</strong><span>Por elemento</span><b>⌄</b></button>{open && <div className="appearance-dropdown-content">{TYPE_ITEMS.length === 0 ? <div className="appearance-empty-type-items"><strong>Sin elementos configurados</strong><small>Los textos de la vista previa se conservan. Iremos agregando y clasificando cada texto uno por uno.</small></div> : <><label>Elemento<select value={item} onChange={e => setItem(e.target.value)}>{TYPE_ITEMS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>{item === 'title' && <label>Texto del título<input value={project.coverSection?.title || ''} onChange={e => set('coverSection.title', e.target.value)} placeholder="Nombre & Nombre" /></label>}<label>Fuente<select value={current.fontFamily} onChange={e => write('fontFamily', e.target.value)}>{FONTS.map(([name, value]) => <option key={value} value={value}>{name}</option>)}</select></label><div className="appearance-type-grid"><label>Tamaño<input type="number" min="8" max="120" value={Number.isFinite(Number(current.fontSize)) ? current.fontSize : DEFAULTS[item].fontSize} onChange={e => write('fontSize', Number(e.target.value))} /></label><label>Peso<select value={current.fontWeight} onChange={e => write('fontWeight', Number(e.target.value))}><option value="300">Ligero</option><option value="400">Normal</option><option value="500">Medio</option><option value="600">Seminegrita</option><option value="700">Negrita</option></select></label><label>Interlineado<input type="number" min="0.8" max="3" step="0.05" value={current.lineHeight} onChange={e => write('lineHeight', Number(e.target.value))} /></label><label>Espaciado<input type="number" min="-5" max="20" step="0.5" value={current.letterSpacing} onChange={e => write('letterSpacing', Number(e.target.value))} /></label></div><div className="appearance-style-switch"><button type="button" className={!previewGradient ? 'active' : ''} onClick={() => write('mode', 'solid')}>Color</button><button type="button" className={previewGradient ? 'active' : ''} onClick={activateGradient}>Degradado</button></div>{previewGradient ? <GradientBuilder value={liveGradient} onChange={value => { write('gradient', value); write('mode', 'gradient') }} /> : <ColorPicker value={currentColor} onChange={value => { write('color', value); write('mode', 'solid') }} />}<div className="appearance-live-type" style={{ fontFamily: current.fontFamily, fontSize: Number(current.fontSize) || DEFAULTS[item].fontSize, fontWeight: Number(current.fontWeight) || 400, lineHeight: Number(current.lineHeight) || 1.5, letterSpacing: Number(current.letterSpacing) || 0, background: previewGradient ? liveGradient : 'none', WebkitBackgroundClip: previewGradient ? 'text' : 'initial', backgroundClip: previewGradient ? 'text' : 'initial', color: previewGradient ? 'transparent' : currentColor }}>Vista previa de {TYPE_ITEMS.find(([id]) => id === item)?.[1]}</div></div>}</section>
}

export default function AppearanceControls({ project, set }) {
  const [open, setOpen] = useState(null)
  const appearance = project.appearance || {}
  const toggle = id => setOpen(value => value === id ? null : id)
  return <div className="appearance-editor"><label className="editor-field"><span>Nombre del proyecto</span><input value={project.name || ''} onChange={e => set('name', e.target.value)} /></label><div className="appearance-card"><strong>Apariencia</strong><small>Control total del diseño, por elemento.</small><BaseStyle id="background" title="Fondo" appearance={appearance} set={set} open={open === 'background'} onToggle={toggle} /><TextureControls appearance={appearance} set={set} /><BaseStyle id="accent" title="Acento" appearance={appearance} set={set} open={open === 'accent'} onToggle={toggle} /><BaseStyle id="text" title="Texto base" appearance={appearance} set={set} open={open === 'text'} onToggle={toggle} /><Typography project={project} set={set} open={open === 'typography'} onToggle={toggle} /></div></div>
}
