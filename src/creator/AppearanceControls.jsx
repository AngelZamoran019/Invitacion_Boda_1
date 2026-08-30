import { useState } from 'react'

const FONTS = [
  ['Playfair Display', "'Playfair Display', serif"], ['Cormorant Garamond', "'Cormorant Garamond', serif"], ['Lora', "'Lora', serif"], ['Libre Baskerville', "'Libre Baskerville', serif"], ['Montserrat', "'Montserrat', sans-serif"], ['Poppins', "'Poppins', sans-serif"], ['Cinzel', "'Cinzel', serif"], ['Great Vibes', "'Great Vibes', cursive"], ['Amoresa', "'Amoresa', cursive"], ['Georgia', 'Georgia, serif'], ['Arial', 'Arial, sans-serif'],
]
const GRADIENTS = [
  ['Dorado', 'linear-gradient(135deg, #8b6f47, #c9a86a, #f4efe8)'], ['Atardecer', 'linear-gradient(135deg, #7c3aed, #b76e79, #c9a86a)'], ['Romántico', 'linear-gradient(135deg, #8f5f6d, #d8b4a0, #f4efe8)'], ['Océano', 'linear-gradient(135deg, #071b35, #1d4e68, #6ea7b8)'], ['Salvia', 'linear-gradient(135deg, #34463d, #879b8e, #d5ded8)'], ['Marfil', 'linear-gradient(135deg, #d8d0c2, #f4efe8, #fffdf8)'], ['Noche', 'linear-gradient(135deg, #05070d, #111827, #374151)'], ['Cielo', 'linear-gradient(135deg, #172554, #2563eb, #93c5fd)'], ['Borgoña', 'linear-gradient(135deg, #350d19, #7f1d35, #d6a0a8)'], ['Arena', 'linear-gradient(135deg, #8c6b4f, #c7a77a, #f2e1c4)'],
]
const TYPE_ITEMS = [['title', 'Título'], ['subtitle', 'Subtítulo'], ['paragraph', 'Párrafos'], ['sectionTitle', 'Títulos de sección'], ['label', 'Etiquetas / encabezados pequeños'], ['small', 'Texto pequeño'], ['button', 'Botones']]
const DEFAULTS = {
  title: { fontFamily: FONTS[0][1], fontSize: 42, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 500, lineHeight: 1.08, letterSpacing: 0 }, subtitle: { fontFamily: FONTS[0][1], fontSize: 16, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 }, paragraph: { fontFamily: FONTS[0][1], fontSize: 16, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 400, lineHeight: 1.7, letterSpacing: 0 }, sectionTitle: { fontFamily: FONTS[0][1], fontSize: 32, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 500, lineHeight: 1.15, letterSpacing: 0 }, label: { fontFamily: FONTS[9][1], fontSize: 11, color: '#c9a86a', mode: 'solid', gradient: '', fontWeight: 700, lineHeight: 1.4, letterSpacing: 2 }, small: { fontFamily: FONTS[9][1], fontSize: 12, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 }, button: { fontFamily: FONTS[9][1], fontSize: 13, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 600, lineHeight: 1.2, letterSpacing: 0.5 },
}
const gradientColors = value => (value || '').match(/#[0-9a-fA-F]{6}/g) || []
const paint = value => value.mode === 'gradient' && value.gradient ? value.gradient : value.color || '#ffffff'

function ColorPicker({ value, onChange }) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(value || '') ? value : '#ffffff'
  return <div className="appearance-color-editor"><div className="appearance-color-picker-wrap"><input className="appearance-color-picker" type="color" value={safe} onChange={e => onChange(e.target.value)} /><span>Elegir cualquier color</span></div><input className="appearance-hex-input" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#FFFFFF" /></div>
}

function GradientBuilder({ value, onChange }) {
  const [colors, setColors] = useState(() => gradientColors(value).length ? gradientColors(value) : ['#8b6f47', '#c9a86a', '#f4efe8'])
  const [type, setType] = useState(() => value?.startsWith('radial-gradient') ? 'radial' : 'linear')
  const [angle, setAngle] = useState('135')
  const sync = (nextColors, nextType = type, nextAngle = angle) => { setColors(nextColors); onChange(nextType === 'linear' ? `linear-gradient(${nextAngle}deg, ${nextColors.join(', ')})` : `radial-gradient(${nextColors.join(', ')})`) }
  return <div className="appearance-gradient-builder">
    <label>Tipo<select value={type} onChange={e => { const next = e.target.value; setType(next); sync(colors, next) }}><option value="linear">Lineal</option><option value="radial">Radial</option></select></label>
    {type === 'linear' && <label>Dirección<select value={angle} onChange={e => { const next = e.target.value; setAngle(next); sync(colors, type, next) }}><option value="0">→</option><option value="45">↗</option><option value="90">↑</option><option value="135">↖</option><option value="180">←</option><option value="225">↙</option><option value="270">↓</option><option value="315">↘</option></select></label>}
    <div className="appearance-gradient-preview" style={{ background: value || GRADIENTS[0][1] }} />
    {colors.map((color, index) => <div className="appearance-gradient-stop" key={`${index}-${color}`}><input type="color" value={color} onChange={e => { const next = [...colors]; next[index] = e.target.value; sync(next) }} /><input value={color} onChange={e => { const next = [...colors]; next[index] = e.target.value; sync(next) }} /><button type="button" disabled={colors.length <= 2} onClick={() => sync(colors.filter((_, i) => i !== index))}>×</button></div>)}
    <button type="button" className="appearance-add-color" onClick={() => sync([...colors, '#ffffff'])}>+ Agregar color</button>
    <div className="appearance-gradient-list">{GRADIENTS.map(([name, gradient]) => <button key={name} type="button" className="appearance-gradient" style={{ background: gradient }} onClick={() => { setColors(gradientColors(gradient)); setType('linear'); setAngle('135'); onChange(gradient) }}><span>{name}</span></button>)}</div>
  </div>
}

function TextureControls({ appearance, set }) {
  // El interruptor controla únicamente el tipo. La URL puede introducirse después.
  // Antes se ocultaban todos los controles si la URL estaba vacía, haciendo imposible
  // activar la textura y luego pegar la imagen.
  const enabled = appearance.backgroundTextureType === 'image'
  const image = appearance.backgroundTextureImage || ''
  const opacity = Number.isFinite(Number(appearance.backgroundTextureOpacity)) ? Number(appearance.backgroundTextureOpacity) : 0.28
  return <section className="appearance-texture-controls">
    <div className="appearance-texture-header"><strong>Textura fotográfica</strong><small>Se coloca encima del color o degradado de todo el fondo.</small></div>
    <label className="appearance-texture-toggle"><input type="checkbox" checked={enabled} onChange={e => set('appearance.backgroundTextureType', e.target.checked ? 'image' : 'none')} /><span>Usar textura</span></label>
    {enabled && <>
      <label>URL de la textura<input type="url" value={image} onChange={e => set('appearance.backgroundTextureImage', e.target.value)} placeholder="https://.../textura.jpg" /></label>
      <small className="appearance-texture-status">{image ? 'Textura configurada. La vista previa se actualiza automáticamente.' : 'Pega una URL directa de una imagen JPG, PNG o WebP.'}</small>
      <label>Opacidad<input type="range" min="0" max="1" step="0.01" value={opacity} onChange={e => set('appearance.backgroundTextureOpacity', Number(e.target.value))} /><small>{Math.round(opacity * 100)}%</small></label>
      <label>Modo de mezcla<select value={appearance.backgroundTextureBlend || 'soft-light'} onChange={e => set('appearance.backgroundTextureBlend', e.target.value)}><option value="normal">Normal</option><option value="multiply">Multiply</option><option value="screen">Screen</option><option value="overlay">Overlay</option><option value="soft-light">Soft Light</option><option value="hard-light">Hard Light</option></select></label>
      <label>Tamaño<select value={appearance.backgroundTextureSize || 'cover'} onChange={e => set('appearance.backgroundTextureSize', e.target.value)}><option value="cover">Cubrir</option><option value="contain">Contener</option><option value="100% 100%">Estirar</option><option value="auto">Original</option></select></label>
      <label>Posición<select value={appearance.backgroundTexturePosition || 'center'} onChange={e => set('appearance.backgroundTexturePosition', e.target.value)}><option value="center">Centro</option><option value="top">Arriba</option><option value="bottom">Abajo</option><option value="left">Izquierda</option><option value="right">Derecha</option></select></label>
      <div className="appearance-texture-preview" style={{ backgroundColor: appearance.backgroundColor || '#0b1730', backgroundImage: appearance.backgroundMode === 'gradient' && appearance.backgroundGradient && image ? `${appearance.backgroundGradient}, url(${JSON.stringify(image)})` : image ? `url(${JSON.stringify(image)})` : 'none', backgroundSize: appearance.backgroundTextureSize || 'cover', backgroundPosition: appearance.backgroundTexturePosition || 'center', backgroundRepeat: 'no-repeat', backgroundBlendMode: appearance.backgroundTextureBlend || 'soft-light' }} />
    </>}
  </section>
}

function BaseStyle({ id, title, appearance, set, open, onToggle }) {
  const mode = appearance[`${id}Mode`] || 'solid', color = appearance[`${id}Color`] || '#ffffff', gradient = appearance[`${id}Gradient`] || ''
  const isGradient = mode === 'gradient' && Boolean(gradient), preview = isGradient ? gradient : color
  return <section className="appearance-dropdown"><button type="button" className="appearance-dropdown-summary" onClick={() => onToggle(id)} aria-expanded={open}><strong>{title}</strong><span className="appearance-current" style={{ background: preview }} /><span>{isGradient ? 'Degradado' : color}</span><b>⌄</b></button>{open && <div className="appearance-dropdown-content"><div className="appearance-style-switch"><button type="button" className={mode === 'solid' ? 'active' : ''} onClick={() => set(`appearance.${id}Mode`, 'solid')}>Color</button><button type="button" className={mode === 'gradient' ? 'active' : ''} onClick={() => set(`appearance.${id}Mode`, 'gradient')}>Degradado</button></div>{mode === 'gradient' ? <GradientBuilder value={gradient} onChange={value => { set(`appearance.${id}Gradient`, value); set(`appearance.${id}Mode`, 'gradient') }} /> : <ColorPicker value={color} onChange={value => { set(`appearance.${id}Color`, value); set(`appearance.${id}Mode`, 'solid') }} />}</div>}</section>
}

function Typography({ project, set, open, onToggle }) {
  const [item, setItem] = useState('title'), appearance = project.appearance || {}, current = { ...DEFAULTS[item], ...(appearance.typography?.[item] || {}) }, gradient = current.mode === 'gradient' && Boolean(current.gradient), write = (key, value) => set(`appearance.typography.${item}.${key}`, value)
  return <section className="appearance-dropdown"><button type="button" className="appearance-dropdown-summary" onClick={() => onToggle('typography')} aria-expanded={open}><strong>Texto y tipografía</strong><span>Por elemento</span><b>⌄</b></button>{open && <div className="appearance-dropdown-content"><label>Elemento<select value={item} onChange={e => setItem(e.target.value)}>{TYPE_ITEMS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>Fuente<select value={current.fontFamily} onChange={e => write('fontFamily', e.target.value)}>{FONTS.map(([name, value]) => <option key={value} value={value}>{name}</option>)}</select></label><div className="appearance-type-grid"><label>Tamaño<input type="number" min="8" max="120" value={current.fontSize} onChange={e => write('fontSize', Number(e.target.value))} /></label><label>Peso<select value={current.fontWeight} onChange={e => write('fontWeight', Number(e.target.value))}><option value="300">Ligero</option><option value="400">Normal</option><option value="500">Medio</option><option value="600">Seminegrita</option><option value="700">Negrita</option></select></label><label>Interlineado<input type="number" min="0.8" max="3" step="0.05" value={current.lineHeight} onChange={e => write('lineHeight', Number(e.target.value))} /></label><label>Espaciado<input type="number" min="-5" max="20" step="0.5" value={current.letterSpacing} onChange={e => write('letterSpacing', Number(e.target.value))} /></label></div><div className="appearance-style-switch"><button type="button" className={!gradient ? 'active' : ''} onClick={() => write('mode', 'solid')}>Color</button><button type="button" className={gradient ? 'active' : ''} onClick={() => write('mode', 'gradient')}>Degradado</button></div>{gradient ? <GradientBuilder value={current.gradient} onChange={value => { write('gradient', value); write('mode', 'gradient') }} /> : <ColorPicker value={current.color} onChange={value => { write('color', value); write('mode', 'solid') }} />}<div className="appearance-live-type" style={{ fontFamily: current.fontFamily, fontSize: current.fontSize, fontWeight: current.fontWeight, lineHeight: current.lineHeight, letterSpacing: current.letterSpacing, background: paint(current), WebkitBackgroundClip: gradient ? 'text' : 'initial', backgroundClip: gradient ? 'text' : 'initial', color: gradient ? 'transparent' : current.color }}>Vista previa de {TYPE_ITEMS.find(([id]) => id === item)?.[1]}</div></div>}</section>
}

export default function AppearanceControls({ project, set }) {
  const [open, setOpen] = useState(null), appearance = project.appearance || {}, toggle = id => setOpen(value => value === id ? null : id)
  return <div className="appearance-editor"><label className="editor-field"><span>Nombre del proyecto</span><input value={project.name || ''} onChange={e => set('name', e.target.value)} /></label><div className="appearance-card"><strong>Apariencia</strong><small>Control total del diseño, por elemento.</small><BaseStyle id="background" title="Fondo" appearance={appearance} set={set} open={open === 'background'} onToggle={toggle} /><TextureControls appearance={appearance} set={set} /><BaseStyle id="accent" title="Acento" appearance={appearance} set={set} open={open === 'accent'} onToggle={toggle} /><BaseStyle id="text" title="Texto base" appearance={appearance} set={set} open={open === 'text'} onToggle={toggle} /><Typography project={project} set={set} open={open === 'typography'} onToggle={toggle} /></div></div>
}
