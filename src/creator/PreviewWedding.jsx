import { useEffect, useState } from 'react'

function PreviewWedding({ project }) {
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    if (!project.countdown.enabled || !project.countdown.targetDate) {
      setRemaining(null)
      return undefined
    }

    const tick = () => {
      const difference = new Date(project.countdown.targetDate).getTime() - Date.now()
      if (difference <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setRemaining({
        days: Math.floor(difference / 86400000),
        hours: Math.floor((difference / 3600000) % 24),
        minutes: Math.floor((difference / 60000) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [project.countdown.enabled, project.countdown.targetDate])

  const appearance = project.appearance
  const title = project.coverSection.title || `${project.couple.name1 || 'Nombre'} & ${project.couple.name2 || 'Nombre'}`
  const storyImage = project.story.images?.[0]

  return (
    <div
      className="wedding-phone"
      style={{
        '--wedding-bg': appearance.backgroundColor,
        '--wedding-accent': appearance.accentColor,
        '--wedding-text': appearance.textColor,
        '--wedding-font': appearance.fontFamily,
      }}
    >
      <div className="wedding-cover" style={project.coverSection.backgroundImage ? { backgroundImage: `linear-gradient(rgb(5 12 28 / 60%), rgb(5 12 28 / 82%)), url(${project.coverSection.backgroundImage})` } : undefined}>
        <div className="cover-ornament">✦</div>
        <p className="cover-eyebrow">{project.coverSection.eyebrow}</p>
        <h2>{title}</h2>
        {project.coverSection.subtitle && <p className="cover-subtitle">{project.coverSection.subtitle}</p>}
        <div className="cover-line" />
        {project.coverSection.date && <p className="cover-date">{project.coverSection.date}</p>}
        {project.coverSection.venue && <p className="cover-venue">{project.coverSection.venue}</p>}
        <button className="cover-button" type="button" onClick={() => document.querySelector('.wedding-phone .couple-section')?.scrollIntoView({ behavior: 'smooth' })}>Abrir invitación</button>
      </div>

      <section className="wedding-section couple-section">
        {project.couple.photo ? <img className="couple-photo" src={project.couple.photo} alt="Los novios" /> : <div className="photo-placeholder">Foto de los novios</div>}
        <p className="section-eyebrow">Con amor</p>
        <h3>{project.couple.name1 || 'Nombre'} <span>&</span> {project.couple.name2 || 'Nombre'}</h3>
        {project.couple.quote && <p className="section-text quote">“{project.couple.quote}”</p>}
      </section>

      {project.music.enabled && project.music.url && (
        <section className="wedding-section music-section">
          <p className="section-eyebrow">Nuestra canción</p>
          <h3>{project.music.title || 'Una canción especial'}</h3>
          <audio controls src={project.music.url}>Tu navegador no puede reproducir este audio.</audio>
        </section>
      )}

      <section className="wedding-section story-section">
        <p className="section-eyebrow">Nuestra historia</p>
        <h3>{project.story.title}</h3>
        {storyImage && <img className="story-image" src={storyImage} alt="Nuestra historia" />}
        <p className="section-text">{project.story.text || 'Aquí aparecerá la historia de ustedes. Cada palabra podrá editarse desde el creador.'}</p>
      </section>

      <section className="wedding-section event-section">
        <p className="section-eyebrow">El gran día</p>
        <h3>{project.event.date ? new Date(`${project.event.date}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Nuestra fecha'}</h3>
        {project.event.time && <p className="event-time">{project.event.time}</p>}
        <div className="event-card">
          <strong>{project.event.ceremonyTitle}</strong>
          <span>{project.event.ceremonyVenue || 'Lugar de ceremonia'}</span>
          <small>{project.event.ceremonyAddress || 'Dirección pendiente'}</small>
          {project.event.ceremonyMapsUrl && <a href={project.event.ceremonyMapsUrl} target="_blank" rel="noreferrer">Ver ubicación</a>}
        </div>
        <div className="event-card">
          <strong>{project.event.receptionTitle}</strong>
          <span>{project.event.receptionVenue || 'Lugar de recepción'}</span>
          <small>{project.event.receptionAddress || 'Dirección pendiente'}</small>
          {project.event.receptionMapsUrl && <a href={project.event.receptionMapsUrl} target="_blank" rel="noreferrer">Ver ubicación</a>}
        </div>
      </section>

      {remaining && (
        <section className="wedding-section countdown-section">
          <p className="section-eyebrow">La cuenta regresiva comienza</p>
          <div className="countdown-grid">
            {Object.entries(remaining).map(([key, value]) => <div key={key}><strong>{String(value).padStart(2, '0')}</strong><span>{key === 'days' ? 'días' : key === 'hours' ? 'horas' : key === 'minutes' ? 'min' : 'seg'}</span></div>)}
          </div>
        </section>
      )}

      {project.dressCode.enabled && (
        <section className="wedding-section dress-section">
          <p className="section-eyebrow">Código de vestimenta</p>
          <h3>Elegancia para celebrar</h3>
          <div className="dress-grid"><div><span>Ellas</span><strong>{project.dressCode.women || 'Por definir'}</strong></div><div><span>Ellos</span><strong>{project.dressCode.men || 'Por definir'}</strong></div></div>
          {project.dressCode.note && <p className="section-text">{project.dressCode.note}</p>}
        </section>
      )}

      {project.gifts.enabled && (
        <section className="wedding-section simple-section">
          <p className="section-eyebrow">Un detalle especial</p>
          <h3>{project.gifts.title}</h3>
          <p className="section-text">{project.gifts.message || 'Su presencia es nuestro mejor regalo.'}</p>
          {project.gifts.url && <a className="gold-button" href={project.gifts.url} target="_blank" rel="noreferrer">{project.gifts.buttonLabel}</a>}
        </section>
      )}

      {project.confirmation.enabled && (
        <section className="wedding-section simple-section">
          <p className="section-eyebrow">Por favor</p>
          <h3>{project.confirmation.title}</h3>
          <p className="section-text">{project.confirmation.message || 'Ayúdanos confirmando tu asistencia.'}</p>
          {project.confirmation.url && <a className="gold-button" href={project.confirmation.url} target="_blank" rel="noreferrer">{project.confirmation.buttonLabel}</a>}
        </section>
      )}

      <section className="wedding-closing">
        {project.closing.image && <img src={project.closing.image} alt="Cierre" />}
        <div><p className="cover-ornament">✦</p><p>{project.closing.message || 'Gracias por ser parte de este momento.'}</p></div>
      </section>
    </div>
  )
}

export default PreviewWedding
