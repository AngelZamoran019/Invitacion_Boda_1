import { useState } from 'react'

const GRADIENTS = [
  ['Azul noche', 'linear-gradient(135deg,#0b1730,#243b53)'], ['Azul elegante', 'linear-gradient(135deg,#16213e,#3b5b7a)'],
  ['Dorado suave', 'linear-gradient(135deg,#8b6f47,#c9a86a,#f4efe8)'], ['Rosa romántico', 'linear-gradient(135deg,#8f5f6d,#d8b4a0)'],
  ['Verde salvia', 'linear-gradient(135deg,#3f5147,#a8b5a5)'], ['Marfil', 'linear-gradient(135deg,#f4efe8,#ffffff)'],
  ['Negro elegante', 'linear-gradient(135deg,#111827,#374151)'], ['Atardecer', 'linear-gradient(135deg,#7c3aed,#b76e79,#c9a86a)'],
]

const FONTS = [
  ['Playfair Display', "'Playfair Display',serif"],
  ['Cormorant Garamond', "'Cormorant Garamond',serif"],
  ['Lora', "'Lora',serif"],
  ['Libre Baskerville', "'Libre Baskerville',serif"],
  ['Montserrat', "'Montserrat',sans-serif"],
  ['Poppins', "'Poppins',sans-serif"],
  ['Cinzel', "'Cinzel',serif"],
  ['Great Vibes', "'Great Vibes',cursive"],
  ['Amoresa', "'Amoresa',cursive"],
  ['Georgia', 'Georgia,serif'],
  ['Arial', 'Arial,sans-serif'],
]

function StyleSection({ id, title, open, onToggle, mode, color, gradient, set }) {
  const prefix = `appearance.${id}`
  const isGradient = mode === 'gradient'
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(color || '') ? color : '#ffffff'

  return <section className="appearance-dropdown">
    <button type="button" className="appearance-dropdown-summary" onClick={() => onToggle(id)} aria-expanded={open}>
      <strong>{title}</strong>
      <span className="appearance-current" style={isGradient ? { background: gradient || GRADIENTS[0][1] } : { backgroundColor: safeColor }} />
      <span>{isGradient ? 'Degradado' : safeColor}</span>
      <b>⌄</b>
    </button>

    {open && <div className="appearance-dropdown-content">
      <div className="appearance-style-switch">
        <button type="button" className={!isGradient ? 'active' : ''} onClick={() => set(`${prefix}Mode`, 'solid')}>Color</button>
        <button type="button" className={isGradient ? 'active' : ''} onClick={() => set(`${prefix}Mode`, 'gradient')}>Degradado</button>
      </div>

      {!isGradient ? <div className="appearance-color-editor">
        <div className="appearance-color-picker-wrap">
          <input className="appearance-color-picker" type="color" value={safeColor} onChange={e => set(`${prefix}Color`, e.target.value)} />
          <span>Elegir cualquier color</span>
        </div>
        <input className="appearance-hex-input" value={color || ''} onChange={e => set(`${prefix}Color`, e.target.value)} placeholder="#FFFFFF" />
        <small>Paleta completa. El selector permite elegir cualquier color disponible.</small>
      </div> : <div className="appearance-gradient-editor">
        <small>Selecciona un degradado. Se guardará para {title.toLowerCase()} y activará el modo degradado.</small>
        <div className="appearance-gradient-list">
          {GRADIENTS.map(([name, value]) => <button key={name} type="button" className="appearance-gradient" style={{ background: value }} onClick={() => {
            set(`${prefix}Gradient`, value)
            set(`${prefix}Mode`, 'gradient')
          }}><span>{name}</span></button>)}
        </div>
      </div>}
    </div>}
  </section>
}

export default function AppearanceControls({ project, set }) {
  const [open, setOpen] = useState(null)
  const a = project.appearance || {}
  const toggle = id => setOpen(v => v === id ? null : id)

  return <div className="appearance-editor">
    <label className="editor-field"><span>Nombre del proyecto</span><input value={project.name || ''} onChange={e => set('name', e.target.value)} /></label>

    <div className="appearance-card">
      <strong>Apariencia</strong>
      <small>Configura cada elemento por separado.</small>

      <StyleSection id="background" title="Fondo" open={open === 'background'} onToggle={toggle} mode={a.backgroundMode || 'solid'} color={a.backgroundColor} gradient={a.backgroundGradient} set={set} />
      <StyleSection id="accent" title="Acento" open={open === 'accent'} onToggle={toggle} mode={a.accentMode || 'solid'} color={a.accentColor} gradient={a.accentGradient} set={set} />
      <StyleSection id="text" title="Texto" open={open === 'text'} onToggle={toggle} mode={a.textMode || 'solid'} color={a.textColor} gradient={a.textGradient} set={set} />

      <section className="appearance-dropdown">
        <button type="button" className="appearance-dropdown-summary" onClick={() => toggle('font')} aria-expanded={open === 'font'}>
          <strong>Tipografía</strong>
          <span>{FONTS.find(f => f[1] === a.fontFamily)?.[0] || 'Playfair Display'}</span>
          <b>⌄</b>
        </button>

        {open === 'font' && <div className="appearance-dropdown-content">
          <select value={a.fontFamily || FONTS[0][1]} onChange={e => set('appearance.fontFamily', e.target.value)}>
            {FONTS.map(([name, value]) => <option key={value} value={value}>{name}</option>)}
          </select>

          <div className="appearance-font-preview" style={{ fontFamily: a.fontFamily || FONTS[0][1] }}>
            Nuestra historia • Ana & Carlos
          </div>

          {a.fontFamily === "'Amoresa',cursive" && <small className="appearance-font-note">
            Amoresa está seleccionada. Para que se vea exactamente igual que en Canva también en la vista previa, el HTML y el teléfono, necesitamos incorporar el archivo webfont con su licencia correspondiente.
          </small>}
        </div>}
      </section>
    </div>
  </div>
}
