const sectionGroups = [
  {
    id: 'design',
    title: 'Diseño',
    items: [
      ['appearance', 'Apariencia'],
      ['coverSection', 'Portada'],
    ],
  },
  {
    id: 'content',
    title: 'Contenido',
    items: [
      ['couple', 'Los novios'],
      ['music', 'Música'],
      ['story', 'Nuestra historia'],
      ['event', 'Evento'],
      ['countdown', 'Cuenta regresiva'],
      ['dressCode', 'Código de vestimenta'],
      ['gifts', 'Mesa de regalos'],
      ['confirmation', 'Confirmación'],
      ['closing', 'Cierre'],
    ],
  },
]

const updateAt = (setProject, updater) => {
  setProject((current) => ({
    ...updater(current),
    updated: new Date().toISOString(),
  }))
}

function TextField({ label, value, onChange, placeholder = '', multiline = false }) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} />
      ) : (
        <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </label>
  )
}

function EditorWedding({ project, setProject, activeSection, setActiveSection }) {
  const [openGroups, setOpenGroups] = React.useState({ design: true, content: false })

  const set = (path, value) => {
    updateAt(setProject, (current) => {
      const next = structuredClone(current)
      const keys = path.split('.')
      let target = next
      keys.slice(0, -1).forEach((key) => { target = target[key] })
      target[keys[keys.length - 1]] = value
      return next
    })
  }

  const selectSection = (groupId, sectionId) => {
    setActiveSection(sectionId)
    setOpenGroups((current) => ({ ...current, [groupId]: true }))
  }

  const toggleGroup = (groupId) => {
    setOpenGroups((current) => ({ ...current, [groupId]: !current[groupId] }))
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="editor-grid">
            <TextField label="Color de fondo" value={project.appearance.backgroundColor} onChange={(v) => set('appearance.backgroundColor', v)} placeholder="#0b1730" />
            <TextField label="Color de acento" value={project.appearance.accentColor} onChange={(v) => set('appearance.accentColor', v)} placeholder="#c9a86a" />
            <TextField label="Color del texto" value={project.appearance.textColor} onChange={(v) => set('appearance.textColor', v)} placeholder="#ffffff" />
            <TextField label="Tipografía" value={project.appearance.fontFamily} onChange={(v) => set('appearance.fontFamily', v)} placeholder="serif" />
          </div>
        )
      case 'coverSection':
        return (
          <div className="editor-grid">
            <TextField label="Texto superior" value={project.coverSection.eyebrow} onChange={(v) => set('coverSection.eyebrow', v)} />
            <TextField label="Nombres" value={project.coverSection.title} onChange={(v) => set('coverSection.title', v)} />
            <TextField label="Subtítulo" value={project.coverSection.subtitle} onChange={(v) => set('coverSection.subtitle', v)} />
            <TextField label="Fecha" value={project.coverSection.date} onChange={(v) => set('coverSection.date', v)} placeholder="24 de octubre de 2026" />
            <TextField label="Lugar" value={project.coverSection.venue} onChange={(v) => set('coverSection.venue', v)} />
            <TextField label="URL de imagen de portada" value={project.coverSection.backgroundImage} onChange={(v) => set('coverSection.backgroundImage', v)} placeholder="https://..." />
          </div>
        )
      case 'couple':
        return (
          <div className="editor-grid">
            <TextField label="Nombre de la novia" value={project.couple.name1} onChange={(v) => { set('couple.name1', v); set('coverSection.title', `${v || 'Nombre'} & ${project.couple.name2 || 'Nombre'}`) }} />
            <TextField label="Nombre del novio" value={project.couple.name2} onChange={(v) => { set('couple.name2', v); set('coverSection.title', `${project.couple.name1 || 'Nombre'} & ${v || 'Nombre'}`) }} />
            <TextField label="Fotografía de los novios (URL)" value={project.couple.photo} onChange={(v) => set('couple.photo', v)} placeholder="https://..." />
            <TextField label="Frase" value={project.couple.quote} onChange={(v) => set('couple.quote', v)} multiline />
          </div>
        )
      case 'music':
        return (
          <div className="editor-grid">
            <TextField label="Título de la canción" value={project.music.title} onChange={(v) => set('music.title', v)} />
            <TextField label="URL del audio" value={project.music.url} onChange={(v) => set('music.url', v)} placeholder="https://..." />
            <label className="toggle-field"><span>Activar música</span><input type="checkbox" checked={project.music.enabled} onChange={(e) => set('music.enabled', e.target.checked)} /></label>
          </div>
        )
      case 'story':
        return (
          <div className="editor-grid">
            <TextField label="Título" value={project.story.title} onChange={(v) => set('story.title', v)} />
            <TextField label="Historia" value={project.story.text} onChange={(v) => set('story.text', v)} multiline />
            <TextField label="Imagen 1 (URL)" value={project.story.images[0] || ''} onChange={(v) => set('story.images', [v, ...project.story.images.slice(1)])} placeholder="https://..." />
          </div>
        )
      case 'event':
        return (
          <div className="editor-grid">
            <TextField label="Fecha" value={project.event.date} onChange={(v) => set('event.date', v)} placeholder="2026-10-24" />
            <TextField label="Hora" value={project.event.time} onChange={(v) => set('event.time', v)} placeholder="18:00" />
            <TextField label="Lugar de ceremonia" value={project.event.ceremonyVenue} onChange={(v) => set('event.ceremonyVenue', v)} />
            <TextField label="Dirección de ceremonia" value={project.event.ceremonyAddress} onChange={(v) => set('event.ceremonyAddress', v)} />
            <TextField label="Google Maps ceremonia" value={project.event.ceremonyMapsUrl} onChange={(v) => set('event.ceremonyMapsUrl', v)} placeholder="https://maps.google.com/..." />
            <TextField label="Lugar de recepción" value={project.event.receptionVenue} onChange={(v) => set('event.receptionVenue', v)} />
            <TextField label="Dirección de recepción" value={project.event.receptionAddress} onChange={(v) => set('event.receptionAddress', v)} />
            <TextField label="Google Maps recepción" value={project.event.receptionMapsUrl} onChange={(v) => set('event.receptionMapsUrl', v)} placeholder="https://maps.google.com/..." />
          </div>
        )
      case 'countdown':
        return (
          <div className="editor-grid">
            <label className="toggle-field"><span>Mostrar cuenta regresiva</span><input type="checkbox" checked={project.countdown.enabled} onChange={(e) => set('countdown.enabled', e.target.checked)} /></label>
            <TextField label="Fecha y hora objetivo" value={project.countdown.targetDate} onChange={(v) => set('countdown.targetDate', v)} placeholder="2026-10-24T18:00" />
          </div>
        )
      case 'dressCode':
        return (
          <div className="editor-grid">
            <label className="toggle-field"><span>Mostrar código de vestimenta</span><input type="checkbox" checked={project.dressCode.enabled} onChange={(e) => set('dressCode.enabled', e.target.checked)} /></label>
            <TextField label="Mujeres" value={project.dressCode.women} onChange={(v) => set('dressCode.women', v)} />
            <TextField label="Hombres" value={project.dressCode.men} onChange={(v) => set('dressCode.men', v)} />
            <TextField label="Nota" value={project.dressCode.note} onChange={(v) => set('dressCode.note', v)} multiline />
          </div>
        )
      case 'gifts':
        return (
          <div className="editor-grid">
            <label className="toggle-field"><span>Mostrar mesa de regalos</span><input type="checkbox" checked={project.gifts.enabled} onChange={(e) => set('gifts.enabled', e.target.checked)} /></label>
            <TextField label="Título" value={project.gifts.title} onChange={(v) => set('gifts.title', v)} />
            <TextField label="Mensaje" value={project.gifts.message} onChange={(v) => set('gifts.message', v)} multiline />
            <TextField label="URL" value={project.gifts.url} onChange={(v) => set('gifts.url', v)} placeholder="https://..." />
            <TextField label="Texto del botón" value={project.gifts.buttonLabel} onChange={(v) => set('gifts.buttonLabel', v)} />
          </div>
        )
      case 'confirmation':
        return (
          <div className="editor-grid">
            <label className="toggle-field"><span>Mostrar confirmación</span><input type="checkbox" checked={project.confirmation.enabled} onChange={(e) => set('confirmation.enabled', e.target.checked)} /></label>
            <TextField label="Título" value={project.confirmation.title} onChange={(v) => set('confirmation.title', v)} />
            <TextField label="Mensaje" value={project.confirmation.message} onChange={(v) => set('confirmation.message', v)} multiline />
            <TextField label="URL del formulario" value={project.confirmation.url} onChange={(v) => set('confirmation.url', v)} placeholder="https://..." />
            <TextField label="Texto del botón" value={project.confirmation.buttonLabel} onChange={(v) => set('confirmation.buttonLabel', v)} />
          </div>
        )
      case 'closing':
        return (
          <div className="editor-grid">
            <TextField label="Imagen final (URL)" value={project.closing.image} onChange={(v) => set('closing.image', v)} placeholder="https://..." />
            <TextField label="Mensaje final" value={project.closing.message} onChange={(v) => set('closing.message', v)} multiline />
          </div>
        )
      default:
        return null
    }
  }

  const activeLabel = sectionGroups
    .flatMap((group) => group.items)
    .find(([id]) => id === activeSection)?.[1] || 'Sección'

  return (
    <div className="editor-layout">
      <aside className="editor-sidebar">
        <div className="editor-sidebar-title">Secciones</div>
        <div className="editor-nav">
          {sectionGroups.map((group) => {
            const isOpen = Boolean(openGroups[group.id])
            const hasActive = group.items.some(([id]) => id === activeSection)

            return (
              <div key={group.id} className={`editor-nav-group ${isOpen ? 'open' : ''} ${hasActive ? 'has-active' : ''}`}>
                <button
                  type="button"
                  className="editor-nav-heading-button"
                  aria-expanded={isOpen}
                  onClick={() => toggleGroup(group.id)}
                >
                  <span>{group.title}</span>
                  <span className="editor-nav-chevron" aria-hidden="true">⌄</span>
                </button>

                <div className="editor-nav-items" aria-hidden={!isOpen}>
                  {group.items.map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={activeSection === id ? 'editor-nav-item active' : 'editor-nav-item'}
                      onClick={() => selectSection(group.id, id)}
                      tabIndex={isOpen ? 0 : -1}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      <section className="editor-content">
        <div className="editor-content-head">
          <div>
            <p className="app-kicker">Editor</p>
            <h2>{activeLabel}</h2>
          </div>
          <span className="editor-status">Guardado local</span>
        </div>
        {renderSection()}
      </section>
    </div>
  )
}

export default EditorWedding
