import { useState } from 'react'
import AppearanceControls, { ColorPicker, GradientBuilder } from './AppearanceControls.jsx'

const sectionGroups = [
  { id: 'design', title: 'Diseño', items: [['appearance', 'Apariencia'], ['coverSection', 'Portada']] },
  { id: 'content', title: 'Contenido', items: [['couple', 'Los novios'], ['music', 'Música'], ['story', 'Nuestra historia'], ['event', 'Evento'], ['countdown', 'Cuenta regresiva'], ['dressCode', 'Código de vestimenta'], ['gifts', 'Mesa de regalos'], ['confirmation', 'Confirmación'], ['closing', 'Cierre']] },
]

const updateAt = (setProject, updater) => setProject((current) => ({ ...updater(current), updated: new Date().toISOString() }))

const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Amoresa', label: 'Amoresa' },
]

function TextField({ label, value, onChange, placeholder = '', multiline = false, type = 'text' }) {
  return <label className="editor-field"><span>{label}</span>{multiline ? <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} /> : <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}</label>
}

function CoverStyleDropdown({ label, color, mode, gradient, size, font, set, prefix, includeFont = true, sizeMin = 1, sizeMax = 200 }) {
  const [open, setOpen] = useState(null)
  const activeMode = mode === 'gradient' ? 'gradient' : 'solid'
  const safeSize = Number.isFinite(Number(size)) ? Number(size) : 0
  const activeFont = FONT_OPTIONS.some((option) => option.value === font) ? font : 'Arial'

  const toggle = (item) => setOpen((current) => current === item ? null : item)
  const setMode = (nextMode) => set(`${prefix}Mode`, nextMode)
  const setGradient = (value) => {
    set(`${prefix}Gradient`, value)
    setMode('gradient')
  }

  return (
    <div className="cover-style-dropdown">
      <button type="button" className="cover-style-summary" onClick={() => setOpen((current) => current === 'menu' ? null : 'menu')} aria-expanded={open === 'menu'}>
        <span>{label}</span>
        <b aria-hidden="true">⌄</b>
      </button>
      {open === 'menu' && (
        <div className="cover-style-menu">
          <div className="cover-style-item">
            <button type="button" className={activeMode === 'solid' ? 'cover-style-option active' : 'cover-style-option'} onClick={() => toggle('color')} aria-expanded={open === 'color'}>
              <span>Color</span><b aria-hidden="true">⌄</b>
            </button>
            {open === 'color' && <div className="cover-style-panel"><ColorPicker value={color} onChange={(value) => { set(`${prefix}Color`, value); setMode('solid') }} /></div>}
          </div>

          <div className="cover-style-item">
            <button type="button" className={activeMode === 'gradient' ? 'cover-style-option active' : 'cover-style-option'} onClick={() => toggle('gradient')} aria-expanded={open === 'gradient'}>
              <span>Degradado</span><b aria-hidden="true">⌄</b>
            </button>
            {open === 'gradient' && <div className="cover-style-panel"><GradientBuilder value={gradient} onChange={setGradient} /></div>}
          </div>

          <div className="cover-style-item">
            <button type="button" className="cover-style-option" onClick={() => toggle('size')} aria-expanded={open === 'size'}>
              <span>Tamaño</span><b aria-hidden="true">⌄</b>
            </button>
            {open === 'size' && <div className="cover-style-panel"><label className="cover-size-field"><span>Tamaño</span><div><input type="number" min={sizeMin} max={sizeMax} step="1" value={safeSize || ''} onChange={(e) => set(`${prefix}Size`, Number(e.target.value))} /><small>px</small></div></label></div>}
          </div>

          {includeFont && (
            <div className="cover-style-item">
              <button type="button" className="cover-style-option" onClick={() => toggle('font')} aria-expanded={open === 'font'}>
                <span>Fuente</span><b aria-hidden="true">⌄</b>
              </button>
              {open === 'font' && <div className="cover-style-panel"><label className="cover-font-field"><span>Fuente</span><select value={activeFont} onChange={(e) => set(`${prefix}Font`, e.target.value)}>{FONT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CoverTextEditor({ label, value, onChange, color, mode, gradient, size, font, set, prefix, placeholder = '', sizeMin = 1, sizeMax = 200 }) {
  return (
    <div className="cover-text-editor">
      <TextField label={label} value={value} onChange={onChange} placeholder={placeholder} />
      <CoverStyleDropdown label="Colores" color={color} mode={mode} gradient={gradient} size={size} font={font} set={set} prefix={prefix} sizeMin={sizeMin} sizeMax={sizeMax} />
    </div>
  )
}

function CoverDecorationEditor({ label, color, mode, gradient, size, set, prefix, sizeMin = 1, sizeMax = 200 }) {
  return <CoverStyleDropdown label={label} color={color} mode={mode} gradient={gradient} size={size} set={set} prefix={prefix} includeFont={false} sizeMin={sizeMin} sizeMax={sizeMax} />
}

function parseCoupleTitle(value, fallbackName1 = '', fallbackName2 = '') {
  const raw = String(value || '').trim()
  const match = raw.match(/^(.+?)\s+(&|y)\s+(.+)$/i)
  if (match) return { name1: match[1].trim(), separator: match[2].toLowerCase() === 'y' ? 'y' : '&', name2: match[3].trim() }
  return { name1: fallbackName1 || '', separator: '&', name2: fallbackName2 || '' }
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
        return (
          <div className="editor-grid cover-editor-grid">
            <CoverTextEditor label="Texto superior" value={cover.eyebrow} onChange={(v) => set('coverSection.eyebrow', v)} color={cover.eyebrowColor} mode={cover.eyebrowMode} gradient={cover.eyebrowGradient} size={cover.eyebrowSize} font={cover.eyebrowFont} set={set} prefix="coverSection.eyebrow" />
            <CoverTextEditor label="Nombres" value={cover.title} onChange={(v) => { const parsed = parseCoupleTitle(v, project.couple?.name1, project.couple?.name2); set('coverSection.title', v); set('couple.name1', parsed.name1); set('couple.name2', parsed.name2); set('couple.separator', parsed.separator) }} color={cover.titleColor} mode={cover.titleMode} gradient={cover.titleGradient} size={cover.titleSize} font={cover.titleFont} set={set} prefix="coverSection.title" />
            <CoverTextEditor label="Fecha" value={cover.date} onChange={(v) => set('coverSection.date', v)} placeholder="24 de octubre de 2026" color={cover.dateColor} mode={cover.dateMode} gradient={cover.dateGradient} size={cover.dateSize} font={cover.dateFont} set={set} prefix="coverSection.date" />
            <CoverTextEditor label="Abrir invitación" value={cover.buttonLabel ?? 'Abrir invitación'} onChange={(v) => set('coverSection.buttonLabel', v)} color={cover.buttonColor} mode={cover.buttonMode} gradient={cover.buttonGradient} size={cover.buttonSize} font={cover.buttonFont} set={set} prefix="coverSection.button" />
            <TextField label="URL de imagen de portada" value={cover.backgroundImage || ''} onChange={(v) => set('coverSection.backgroundImage', v)} placeholder="https://..." />
            <CoverDecorationEditor label="Color del diamante" color={cover.ornamentColor} mode={cover.ornamentMode} gradient={cover.ornamentGradient} size={cover.ornamentSize} set={set} prefix="coverSection.ornament" sizeMin={8} sizeMax={100} />
            <CoverDecorationEditor label="Color de la línea" color={cover.lineColor || lineFallback} mode={cover.lineMode} gradient={cover.lineGradient} size={cover.lineSize} set={set} prefix="coverSection.line" sizeMin={10} sizeMax={300} />
            <label className="editor-field"><span>Oscuridad de la capa sobre la fotografía</span><input type="range" min="0" max="1" step="0.01" value={Number.isFinite(Number(cover.photoOverlayOpacity)) ? Number(cover.photoOverlayOpacity) : (Number.isFinite(Number(project.couple?.photoOverlayOpacity)) ? Number(project.couple.photoOverlayOpacity) : 0.55)} onChange={(e) => { const value = Number(e.target.value); set('coverSection.photoOverlayOpacity', value); set('couple.photoOverlayOpacity', value) }} /><small>{Math.round((Number.isFinite(Number(cover.photoOverlayOpacity)) ? Number(cover.photoOverlayOpacity) : (Number.isFinite(Number(project.couple?.photoOverlayOpacity)) ? Number(project.couple.photoOverlayOpacity) : 0.55)) * 100)}% de oscuridad</small></label>
          </div>
        )
      }
      case 'couple': return <div className="editor-grid"><TextField label="Fotografía de los novios (URL)" value={project.couple.photo} onChange={(v) => set('couple.photo', v)} placeholder="https://..." /><TextField label="Frase" value={project.couple.quote} onChange={(v) => set('couple.quote', v)} multiline /></div>
      case 'music': return <div className="editor-grid"><TextField label="Título de la canción" value={project.music.title} onChange={(v) => set('music.title', v)} /><TextField label="URL del audio" value={project.music.url} onChange={(v) => set('music.url', v)} placeholder="https://..." /><label className="toggle-field"><span>Activar música</span><input type="checkbox" checked={project.music.enabled} onChange={(e) => set('music.enabled', e.target.checked)} /></label></div>
      case 'story': return <div className="editor-grid"><TextField label="Título de sección" value={project.story.sectionTitle ?? 'Nuestra historia'} onChange={(v) => set('story.sectionTitle', v)} /><TextField label="Subtítulo" value={project.story.title} onChange={(v) => set('story.title', v)} /><TextField label="Historia" value={project.story.text} onChange={(v) => set('story.text', v)} multiline /><TextField label="Imagen 1 (URL)" value={project.story.images[0] || ''} onChange={(v) => set('story.images', [v, ...project.story.images.slice(1)])} placeholder="https://..." /></div>
      case 'event': return <div className="editor-grid"><TextField label="Título de sección" value={project.event.sectionTitle ?? 'El gran día'} onChange={(v) => set('event.sectionTitle', v)} /><TextField label="Título de ceremonia" value={project.event.ceremonyTitle ?? 'Ceremonia'} onChange={(v) => set('event.ceremonyTitle', v)} /><TextField label="Título de recepción" value={project.event.receptionTitle ?? 'Recepción'} onChange={(v) => set('event.receptionTitle', v)} /><TextField label="Fecha" type="text" value={project.event.date ?? ''} onChange={(v) => set('event.date', v)} placeholder="Ej. 24 de octubre de 2026, sábado 24/10, etc." /><TextField label="Hora" value={project.event.time} onChange={(v) => set('event.time', v)} placeholder="18:00" /><TextField label="Dirección de ceremonia" value={project.event.ceremonyAddress} onChange={(v) => set('event.ceremonyAddress', v)} /><TextField label="Google Maps ceremonia" value={project.event.ceremonyMapsUrl} onChange={(v) => set('event.ceremonyMapsUrl', v)} placeholder="https://maps.google.com/..." /><TextField label="Dirección de recepción" value={project.event.receptionAddress} onChange={(v) => set('event.receptionAddress', v)} /><TextField label="Google Maps recepción" value={project.event.receptionMapsUrl} onChange={(v) => set('event.receptionMapsUrl', v)} placeholder="https://maps.google.com/..." /></div>
      case 'countdown': return <div className="editor-grid"><label className="toggle-field"><span>Mostrar cuenta regresiva</span><input type="checkbox" checked={project.countdown.enabled} onChange={(e) => set('countdown.enabled', e.target.checked)} /></label><TextField label="Fecha y hora objetivo" type="datetime-local" value={project.countdown.targetDate} onChange={(v) => set('countdown.targetDate', v)} /><TextField label="Título de sección" value={project.countdown.sectionTitle ?? 'La cuenta regresiva comienza'} onChange={(v) => set('countdown.sectionTitle', v)} /></div>
      case 'dressCode': { const dress = project.dressCode || {}; return <div className="editor-grid"><label className="toggle-field"><span>Mostrar código de vestimenta</span><input type="checkbox" checked={dress.enabled !== false} onChange={(e) => set('dressCode.enabled', e.target.checked)} /></label><TextField label="Título de sección" value={dress.sectionTitle ?? 'Código de vestimenta'} onChange={(v) => set('dressCode.sectionTitle', v)} /><TextField label="Subtítulo" value={dress.subtitle ?? 'Elegancia para celebrar'} onChange={(v) => set('dressCode.subtitle', v)} /><TextField label="Hombres" value={dress.menLabel ?? 'Ellas'} onChange={(v) => set('dressCode.menLabel', v)} /><TextField label="Mujeres" value={dress.womenLabel ?? 'Ellos'} onChange={(v) => set('dressCode.womenLabel', v)} /><TextField label="Vestimenta hombre" value={dress.menAttire ?? dress.men ?? 'Formal'} onChange={(v) => set('dressCode.menAttire', v)} /><TextField label="Vestimenta Mujeres" value={dress.womenAttire ?? dress.women ?? 'Formal'} onChange={(v) => set('dressCode.womenAttire', v)} /><TextField label="Nota" value={dress.note ?? ''} onChange={(v) => set('dressCode.note', v)} multiline /></div> }
      case 'gifts': return <div className="editor-grid"><label className="toggle-field"><span>Mostrar mesa de regalos</span><input type="checkbox" checked={project.gifts.enabled} onChange={(e) => set('gifts.enabled', e.target.checked)} /></label><TextField label="Título de sección" value={project.gifts.sectionTitle ?? 'Un detalle especial'} onChange={(v) => set('gifts.sectionTitle', v)} /><TextField label="Subtítulo" value={project.gifts.subtitle ?? 'subtitulo'} onChange={(v) => set('gifts.subtitle', v)} /><TextField label="URL" value={project.gifts.url} onChange={(v) => set('gifts.url', v)} placeholder="https://..." /><TextField label="Texto del botón" value={project.gifts.buttonLabel} onChange={(v) => set('gifts.buttonLabel', v)} /></div>
      case 'confirmation': { const confirmation = project.confirmation || {}; return <div className="editor-grid"><label className="toggle-field"><span>Mostrar confirmación</span><input type="checkbox" checked={confirmation.enabled !== false} onChange={(e) => set('confirmation.enabled', e.target.checked)} /></label><TextField label="Título de sección" value={confirmation.sectionTitle ?? 'Por favor'} onChange={(v) => set('confirmation.sectionTitle', v)} /><TextField label="Subtítulo" value={confirmation.subtitle ?? 'Confirma tu asistencia'} onChange={(v) => set('confirmation.subtitle', v)} /><TextField label="Mensaje" value={confirmation.message} onChange={(v) => set('confirmation.message', v)} multiline /><TextField label="Texto después de confirmar" value={confirmation.successMessage} onChange={(v) => set('confirmation.successMessage', v)} multiline /><TextField label="Texto del botón" value={confirmation.buttonLabel} onChange={(v) => set('confirmation.buttonLabel', v)} /><div className="editor-info-box"><strong>Formulario de invitados</strong><span>La página de confirmación incluye nombre, asistencia, número de invitados y mensaje.</span></div></div> }
      case 'closing': return <div className="editor-grid"><TextField label="Imagen final (URL)" value={project.closing.image} onChange={(v) => set('closing.image', v)} placeholder="https://..." /><TextField label="Mensaje final" value={project.closing.message} onChange={(v) => set('closing.message', v)} multiline /></div>
      default: return null
    }
  }
  const activeLabel = sectionGroups.flatMap((group) => group.items).find(([id]) => id === activeSection)?.[1] || 'Sección'
  return <div className="editor-layout"><aside className="editor-sidebar"><div className="editor-sidebar-title">Secciones</div><div className="editor-nav">{sectionGroups.map((group) => { const isOpen=Boolean(openGroups[group.id]); const hasActive=group.items.some(([id])=>id===activeSection); return <div key={group.id} className={`editor-nav-group ${isOpen?'open':''} ${hasActive?'has-active':''}`}><button type="button" className="editor-nav-heading-button" aria-expanded={isOpen} onClick={()=>toggleGroup(group.id)}><span>{group.title}</span><span className="editor-nav-chevron" aria-hidden="true">⌄</span></button><div className="editor-nav-items" aria-hidden={!isOpen}>{group.items.map(([id,label])=><button key={id} type="button" className={activeSection===id?'editor-nav-item active':'editor-nav-item'} onClick={()=>selectSection(group.id,id)} tabIndex={isOpen?0:-1}>{label}</button>)}</div></div>})}</div></aside><section className="editor-content"><div className="editor-content-head"><div><p className="app-kicker">Editor</p><h2>{activeLabel}</h2></div><span className="editor-status">Guardado automático</span></div>{renderSection()}</section></div>
}
export default EditorWedding
