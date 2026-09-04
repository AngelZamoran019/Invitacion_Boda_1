import { useState } from 'react'
import AppearanceControls, { ColorPicker, GradientBuilder } from './AppearanceControls.jsx'
import { WEDDING_FONTS } from '../fonts/weddingFonts.js'

const sectionGroups = [
  { id: 'design', title: 'Diseño', items: [['appearance', 'Apariencia'], ['coverSection', 'Portada']] },
  { id: 'content', title: 'Contenido', items: [['couple', 'Los novios'], ['music', 'Música'], ['story', 'Nuestra historia'], ['event', 'Evento'], ['countdown', 'Cuenta regresiva'], ['dressCode', 'Código de vestimenta'], ['gifts', 'Mesa de regalos'], ['confirmation', 'Confirmación'], ['closing', 'Cierre']] },
]

const updateAt = (setProject, updater) => setProject((current) => ({ ...updater(current), updated: new Date().toISOString() }))
const FONT_OPTIONS = WEDDING_FONTS

function TextField({ label, value, onChange, placeholder = '', multiline = false, type = 'text' }) {
  return <label className="editor-field"><span>{label}</span>{multiline ? <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} /> : <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}</label>
}

function CoverStyleDropdown({ label, color, mode, gradient, size, font, positionY, set, prefix, includeFont = true, sizeMin = 1, sizeMax = 200, defaultSize = 16 }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openOption, setOpenOption] = useState(null)
  const activeMode = mode === 'gradient' ? 'gradient' : 'solid'
  const numericSize = Number(size)
  const safeSize = Number.isFinite(numericSize) && numericSize > 0 ? numericSize : defaultSize
  const numericPosition = Number(positionY)
  const safePosition = Number.isFinite(numericPosition) ? numericPosition : 0
  const activeFont = FONT_OPTIONS.some((option) => option.value === font) ? font : 'Arial'
  const toggleOption = (item) => setOpenOption((current) => current === item ? null : item)
  const setMode = (nextMode) => set(`${prefix}Mode`, nextMode)
  const setGradient = (value) => { set(`${prefix}Gradient`, value); setMode('gradient') }
  return <div className="cover-style-dropdown">
    <button type="button" className="cover-style-summary" onClick={() => { setMenuOpen((current) => !current); setOpenOption(null) }} aria-expanded={menuOpen}><span>{label}</span><b aria-hidden="true">⌄</b></button>
    {menuOpen && <div className="cover-style-menu">
      <div className="cover-style-item"><button type="button" className={activeMode === 'solid' ? 'cover-style-option active' : 'cover-style-option'} onClick={() => toggleOption('color')} aria-expanded={openOption === 'color'}><span>Color</span><b aria-hidden="true">⌄</b></button>{openOption === 'color' && <div className="cover-style-panel"><ColorPicker value={color} onChange={(value) => { set(`${prefix}Color`, value); setMode('solid') }} /></div>}</div>
      <div className="cover-style-item"><button type="button" className={activeMode === 'gradient' ? 'cover-style-option active' : 'cover-style-option'} onClick={() => toggleOption('gradient')} aria-expanded={openOption === 'gradient'}><span>Degradado</span><b aria-hidden="true">⌄</b></button>{openOption === 'gradient' && <div className="cover-style-panel"><GradientBuilder value={gradient} onChange={setGradient} /></div>}</div>
      <div className="cover-style-item"><button type="button" className="cover-style-option" onClick={() => toggleOption('size')} aria-expanded={openOption === 'size'}><span>Tamaño</span><b aria-hidden="true">⌄</b></button>{openOption === 'size' && <div className="cover-style-panel"><label className="cover-size-field"><span>Tamaño</span><div><input type="number" min={sizeMin} max={sizeMax} step="1" value={safeSize} onChange={(e) => set(`${prefix}Size`, Number(e.target.value))} /><small>px</small></div></label></div>}</div>
      {includeFont && <div className="cover-style-item"><button type="button" className="cover-style-option" onClick={() => toggleOption('font')} aria-expanded={openOption === 'font'}><span>Fuente</span><b aria-hidden="true">⌄</b></button>{openOption === 'font' && <div className="cover-style-panel"><label className="cover-font-field"><span>Fuente</span><select value={activeFont} onChange={(e) => set(`${prefix}Font`, e.target.value)}>{FONT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div>}</div>}
      <div className="cover-style-item"><button type="button" className="cover-style-option" onClick={() => toggleOption('position')} aria-expanded={openOption === 'position'}><span>Posición</span><b aria-hidden="true">⌄</b></button>{openOption === 'position' && <div className="cover-style-panel"><label className="cover-size-field"><span>Arriba / abajo</span><div><input type="number" min="-300" max="300" step="1" value={safePosition} onChange={(e) => set(`${prefix}PositionY`, Number(e.target.value))} /><small>px</small></div></label><small>Negativo = arriba · Positivo = abajo</small></div>}</div>
    </div>}
  </div>
}

function CoverTextEditor({ label, value, onChange, color, mode, gradient, size, font, positionY, set, prefix, placeholder = '', defaultSize = 16, sizeMin = 1, sizeMax = 200 }) {
  return <div className="cover-text-editor"><TextField label={label} value={value} onChange={onChange} placeholder={placeholder} /><CoverStyleDropdown label="Colores" color={color} mode={mode} gradient={gradient} size={size} font={font} positionY={positionY} set={set} prefix={prefix} defaultSize={defaultSize} sizeMin={sizeMin} sizeMax={sizeMax} /></div>
}

function CoverDecorationEditor({ label, color, mode, gradient, size, positionY, set, prefix, defaultSize, sizeMin = 1, sizeMax = 200 }) {
  return <CoverStyleDropdown label={label} color={color} mode={mode} gradient={gradient} size={size} positionY={positionY} set={set} prefix={prefix} includeFont={false} defaultSize={defaultSize} sizeMin={sizeMin} sizeMax={sizeMax} />
}

function EditorWedding({ project, setProject, activeSection, setActiveSection }) {
  const [openGroups, setOpenGroups] = useState({ design: true, content: false })
  const set = (path, value) => updateAt(setProject, (current) => { const next = structuredClone(current); const keys = path.split('.'); let target = next; keys.slice(0, -1).forEach((key) => { target = target[key] }); target[keys[keys.length - 1]] = value; return next })
  const selectSection = (groupId, sectionId) => { setActiveSection(sectionId); setOpenGroups((current) => ({ ...current, [groupId]: true })) }
  const toggleGroup = (groupId) => setOpenGroups((current) => ({ ...current, [groupId]: !current[groupId] }))
  const renderSection = () => {
    switch (activeSection) {
      case 'appearance': return <AppearanceControls project={project} set={set} />
      case 'coverSection': {
        const cover = project.coverSection || {}
        const lineFallback = project.appearance?.accentColor || '#c9a86a'
        return <div className="editor-grid cover-editor-grid">
          <CoverTextEditor label="Texto superior" value={cover.eyebrow} onChange={(v) => set('coverSection.eyebrow', v)} color={cover.eyebrowColor} mode={cover.eyebrowMode} gradient={cover.eyebrowGradient} size={cover.eyebrowSize} font={cover.eyebrowFont} positionY={cover.eyebrowPositionY} set={set} prefix="coverSection.eyebrow" defaultSize={11} />
          <CoverTextEditor label="Nombres" value={cover.title} onChange={(v) => set('coverSection.title', v)} color={cover.titleColor} mode={cover.titleMode} gradient={cover.titleGradient} size={cover.titleSize} font={cover.titleFont} positionY={cover.titlePositionY} set={set} prefix="coverSection.title" defaultSize={42} />
          <CoverTextEditor label="Fecha" value={cover.date} onChange={(v) => set('coverSection.date', v)} placeholder="24 de octubre de 2026" color={cover.dateColor} mode={cover.dateMode} gradient={cover.dateGradient} size={cover.dateSize} font={cover.dateFont} positionY={cover.datePositionY} set={set} prefix="coverSection.date" defaultSize={12} />
          <CoverTextEditor label="Abrir invitación" value={cover.buttonLabel ?? 'Abrir invitación'} onChange={(v) => set('coverSection.buttonLabel', v)} color={cover.buttonColor} mode={cover.buttonMode} gradient={cover.buttonGradient} size={cover.buttonSize} font={cover.buttonFont} positionY={cover.buttonPositionY} set={set} prefix="coverSection.button" defaultSize={13} />
          <TextField label="URL de imagen de portada" value={cover.backgroundImage || ''} onChange={(v) => set('coverSection.backgroundImage', v)} placeholder="https://..." />
          <CoverDecorationEditor label="Color del diamante" color={cover.ornamentColor} mode={cover.ornamentMode} gradient={cover.ornamentGradient} size={cover.ornamentSize} positionY={cover.ornamentPositionY} set={set} prefix="coverSection.ornament" defaultSize={30} sizeMin={8} sizeMax={100} />
          <CoverDecorationEditor label="Color de la línea" color={cover.lineColor || lineFallback} mode={cover.lineMode} gradient={cover.lineGradient} size={cover.lineSize} positionY={cover.linePositionY} set={set} prefix="coverSection.line" defaultSize={70} sizeMin={10} sizeMax={300} />
          <label className="editor-field"><span>Oscuridad de la capa sobre la fotografía</span><input type="range" min="0" max="1" step="0.01" value={Number.isFinite(Number(cover.photoOverlayOpacity)) ? Number(cover.photoOverlayOpacity) : (Number.isFinite(Number(project.couple?.photoOverlayOpacity)) ? Number(project.couple.photoOverlayOpacity) : 0.55)} onChange={(e) => { const value = Number(e.target.value); set('coverSection.photoOverlayOpacity', value); set('couple.photoOverlayOpacity', value) }} /><small>{Math.round((Number.isFinite(Number(cover.photoOverlayOpacity)) ? Number(cover.photoOverlayOpacity) : (Number.isFinite(Number(project.couple?.photoOverlayOpacity)) ? Number(project.couple.photoOverlayOpacity) : 0.55)) * 100)}% de oscuridad</small></label>
        </div>
      }
      case 'couple': {
        const couple = project.couple || {}
        const fullNames = String(couple.displayNames || '').trim() || `${couple.name1 || 'Nombre'} ${couple.separator || 'y'} ${couple.name2 || 'Nombre'}`
        return <div className="editor-grid"><TextField label="Nombres" value={fullNames} onChange={(value) => set('couple.displayNames', value)} placeholder="Angel y Danae" /><TextField label="Fotografía de los novios (URL)" value={project.couple.photo} onChange={(v) => set('couple.photo', v)} placeholder="https://..." /><TextField label="Frase" value={project.couple.quote} onChange={(v) => set('couple.quote', v)} multiline /></div>
      }
      case 'music': return <div className="editor-grid"><TextField label="Título de la canción" value={project.music.title} onChange={(v) => set('music.title', v)} /><TextField label="URL del audio" value={project.music.url} onChange={(v) => set('music.url', v)} placeholder="https://..." /><label className="toggle-field"><span>Activar música</span><input type="checkbox" checked={project.music.enabled} onChange={(e) => set('music.enabled', e.target.checked)} /></label></div>
      case 'story': return <div className="editor-grid"><TextField label="Título de sección" value={project.story.sectionTitle ?? 'Nuestra historia'} onChange={(v) => set('story.sectionTitle', v)} /><TextField label="Subtítulo" value={project.story.title} onChange={(v) => set('story.title', v)} /><TextField label="Historia" value={project.story.text} onChange={(v) => set('story.text', v)} multiline /><TextField label="Imagen 1 (URL)" value={project.story.images[0] || ''} onChange={(v) => set('story.images', [v, ...project.story.images.slice(1)])} placeholder="https://..." /></div>
      case 'event': return <div className="editor-grid"><TextField label="Título de sección" value={project.event.sectionTitle ?? 'El gran día'} onChange={(v) => set('event.sectionTitle', v)} /><TextField label="Título de ceremonia" value={project.event.ceremonyTitle ?? 'Ceremonia'} onChange={(v) => set('event.ceremonyTitle', v)} /><TextField label="Título de recepción" value={project.event.receptionTitle ?? 'Recepción'} onChange={(v) => set('event.receptionTitle', v)} /><TextField label="Fecha" type="text" value={project.event.date ?? ''} onChange={(v) => set('event.date', v)} placeholder="Ej. 24 de octubre de 2026, sábado 24/10, etc." /><TextField label="Hora" value={project.event.time} onChange={(v) => set('event.time', v)} placeholder="18:00" /><TextField label="Dirección de ceremonia" value={project.event.ceremonyAddress} onChange={(v) => set('event.ceremonyAddress', v)} /><TextField label="Google Maps ceremonia" value={project.event.ceremonyMapsUrl} onChange={(v) => set('event.ceremonyMapsUrl', v)} placeholder="https://maps.google.com/..." /><TextField label="Dirección de recepción" value={project.event.receptionAddress} onChange={(v) => set('event.receptionAddress', v)} /><TextField label="Google Maps recepción" value={project.event.receptionMapsUrl} onChange={(v) => set('event.receptionMapsUrl', v)} placeholder="https://maps.google.com/..." /></div>
      case 'countdown': return <div className="editor-grid"><label className="toggle-field"><span>Mostrar cuenta regresiva</span><input type="checkbox" checked={project.countdown.enabled} onChange={(e) => set('countdown.enabled', e.target.checked)} /></label><TextField label="Fecha y hora objetivo" type="datetime-local" value={project.countdown.targetDate} onChange={(v) => set('countdown.targetDate', v)} /><TextField label="Título de sección" value={project.countdown.sectionTitle ?? 'La cuenta regresiva comienza'} onChange={(v) => set('countdown.sectionTitle', v)} /></div>
      case 'dressCode': { const dress = project.dressCode || {}; return <div className="editor-grid"><label className="toggle-field"><span>Mostrar código de vestimenta</span><input type="checkbox" checked={dress.enabled !== false} onChange={(e) => set('dressCode.enabled', e.target.checked)} /></label><TextField label="Título de sección" value={dress.sectionTitle ?? 'Código de vestimenta'} onChange={(v) => set('dressCode.sectionTitle', v)} /><TextField label="Subtítulo" value={dress.subtitle ?? 'Elegancia para celebrar'} onChange={(v) => set('dressCode.subtitle', v)} /><TextField label="Hombres" value={dress.menLabel ?? 'Ellas'} onChange={(v) => set('dressCode.menLabel', v)} /><TextField label="Mujeres" value={dress.womenLabel ?? 'Ellos'} onChange={(v) => set('dressCode.womenLabel', v)} /><TextField label="Vestimenta hombre" value={dress.menAttire ?? dress.men ?? 'Formal'} onChange={(v) => set('dressCode.menAttire', v)} /><TextField label="Vestimenta Mujeres" value={dress.womenAttire ?? dress.women ?? 'Formal'} onChange={(v) => set('dressCode.womenAttire', v)} /><TextField label="Nota" value={dress.note ?? ''} onChange={(v) => set('dressCode.note', v)} multiline /></div> }
      case 'gifts': return <div className="editor-grid"><label className="toggle-field"><span>Mostrar mesa de regalos</span><input type="checkbox" checked={project.gifts.enabled} onChange={(e) => set('gifts.enabled', e.target.checked)} /></label><TextField label="Título de sección" value={project.gifts.sectionTitle ?? 'Un detalle especial'} onChange={(v) => set('gifts.sectionTitle', v)} /><TextField label="Subtítulo" value={project.gifts.subtitle ?? 'subtitulo'} onChange={(v) => set('gifts.subtitle', v)} /><TextField label="URL" value={project.gifts.url} onChange={(v) => set('gifts.url', v)} placeholder="https://..." /><TextField label="Texto del botón" value={project.gifts.buttonLabel ?? 'Ver mesa de regalos'} onChange={(v) => set('gifts.buttonLabel', v)} /></div>
      case 'confirmation': return <div className="editor-grid"><label className="toggle-field"><span>Mostrar confirmación</span><input type="checkbox" checked={project.confirmation.enabled} onChange={(e) => set('confirmation.enabled', e.target.checked)} /></label><TextField label="Título de sección" value={project.confirmation.sectionTitle ?? 'Por favor'} onChange={(v) => set('confirmation.sectionTitle', v)} /><TextField label="Subtítulo" value={project.confirmation.subtitle ?? 'Confirma tu asistencia'} onChange={(v) => set('confirmation.subtitle', v)} /><TextField label="Mensaje" value={project.confirmation.message} onChange={(v) => set('confirmation.message', v)} multiline /><TextField label="URL de confirmación" value={project.confirmation.url} onChange={(v) => set('confirmation.url', v)} placeholder="https://..." /><TextField label="Texto del botón" value={project.confirmation.buttonLabel ?? 'Confirmar asistencia'} onChange={(v) => set('confirmation.buttonLabel', v)} /><TextField label="Mensaje de éxito" value={project.confirmation.successMessage ?? ''} onChange={(v) => set('confirmation.successMessage', v)} /></div>
      case 'closing': return <div className="editor-grid"><TextField label="Imagen de cierre (URL)" value={project.closing.image} onChange={(v) => set('closing.image', v)} placeholder="https://..." /><TextField label="Mensaje de cierre" value={project.closing.message} onChange={(v) => set('closing.message', v)} multiline /></div>
      default: return null
    }
  }
  return <div className="editor-layout"><aside className="editor-sidebar">{sectionGroups.map((group) => <div key={group.id} className="editor-group"><button type="button" className="editor-group-title" onClick={() => toggleGroup(group.id)}><span>{group.title}</span><b aria-hidden="true">{openGroups[group.id] ? '⌃' : '⌄'}</b></button>{openGroups[group.id] && <div className="editor-group-items">{group.items.map(([id, label]) => <button key={id} type="button" className={activeSection === id ? 'editor-nav-item active' : 'editor-nav-item'} onClick={() => selectSection(group.id, id)}>{label}</button>)}</div>}</div>)}</aside><main className="editor-main">{renderSection()}</main></div>
}

export default EditorWedding
