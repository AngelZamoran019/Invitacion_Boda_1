const esc = (value = '') => String(value).replace(/[&<>\"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[char]))

const DEFAULT_TEXT = {
  title: { fontFamily: "'Playfair Display', serif", fontSize: 42, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 500, lineHeight: 1.08, letterSpacing: 0 },
  subtitle: { fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
  paragraph: { fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 400, lineHeight: 1.7, letterSpacing: 0 },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 500, lineHeight: 1.15, letterSpacing: 0 },
  label: { fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#c9a86a', mode: 'solid', gradient: '', fontWeight: 700, lineHeight: 1.4, letterSpacing: 2 },
  small: { fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
  button: { fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#ffffff', mode: 'solid', gradient: '', fontWeight: 600, lineHeight: 1.2, letterSpacing: 0.5 },
}

const textStyle = value => {
  const x = value || DEFAULT_TEXT.paragraph
  const paint = x.mode === 'gradient' && x.gradient ? x.gradient : ''
  return `font-family:${esc(x.fontFamily)};font-size:${Number(x.fontSize) || 16}px;font-weight:${Number(x.fontWeight) || 400};line-height:${Number(x.lineHeight) || 1.5};letter-spacing:${Number(x.letterSpacing) || 0}px;${paint ? `background:${esc(paint)};-webkit-background-clip:text;background-clip:text;color:transparent;` : `color:${esc(x.color || '#fff')};`}`
}

export function buildWeddingHTML(project) {
  const a = project.appearance || {}
  const typography = a.typography || {}
  const getText = key => ({ ...DEFAULT_TEXT[key], ...(typography[key] || {}) })
  const titleText = getText('title')
  const subtitleText = getText('subtitle')
  const paragraphText = getText('paragraph')
  const sectionText = getText('sectionTitle')
  const labelText = getText('label')
  const smallText = getText('small')
  const buttonText = getText('button')

  const c = project.coverSection || {}
  const couple = project.couple || {}
  const story = project.story || {}
  const event = project.event || {}
  const countdown = project.countdown || {}
  const dress = project.dressCode || {}
  const gifts = project.gifts || {}
  const confirmation = project.confirmation || {}
  const closing = project.closing || {}

  const background = a.backgroundMode === 'gradient' && a.backgroundGradient ? a.backgroundGradient : a.backgroundColor || '#0b1730'
  const accent = a.accentMode === 'gradient' && a.accentGradient ? a.accentGradient : a.accentColor || '#c9a86a'
  const textColor = a.textColor || '#ffffff'
  const font = a.fontFamily || "'Playfair Display', serif"
  const title = c.title || `${couple.name1 || 'Nombre'} & ${couple.name2 || 'Nombre'}`
  const coupleMatch = String(title).trim().match(/^(.+?)\s+(&|y)\s+(.+)$/i)
  const displayName1 = coupleMatch ? coupleMatch[1].trim() : (couple.name1 || 'Nombre')
  const displaySeparator = coupleMatch ? (coupleMatch[2].toLowerCase() === 'y' ? 'y' : '&') : (couple.separator === 'y' ? 'y' : '&')
  const displayName2 = coupleMatch ? coupleMatch[3].trim() : (couple.name2 || 'Nombre')

  // El fondo de apariencia es la única capa de fondo de toda la invitación.
  // La imagen de portada ya no sustituye el fondo global, evitando cortes entre secciones.
  const coverStyle = 'background:var(--bg);'

  const storyImage = story.images?.[0] ? `<img class="story-image" src="${esc(story.images[0])}" alt="Nuestra historia">` : ''
  const couplePhoto = couple.photo ? `<img class="couple-photo" src="${esc(couple.photo)}" alt="Los novios">` : '<div class="photo-placeholder">Foto de los novios</div>'
  const accentPaint = a.accentMode === 'gradient' && a.accentGradient
    ? `background:${esc(a.accentGradient)};-webkit-background-clip:text;background-clip:text;color:transparent;`
    : `color:${esc(a.accentColor || '#c9a86a')};`

  const style = `
    :root{--bg:${esc(background)};--accent:${esc(accent)};--text:${esc(textColor)};--font:${esc(font)}}
    *{box-sizing:border-box}
    html,body{margin:0;min-height:100%;background:var(--bg);font-family:var(--font),Georgia,serif;color:var(--text)}
    body{display:grid;place-items:center;background:var(--bg)}
    .phone{width:min(100vw,430px);height:100svh;min-height:620px;overflow-y:auto;overflow-x:hidden;background:var(--bg);background-color:var(--bg);scroll-behavior:smooth}
    .cover,.section,.closing{width:100%;padding:48px 26px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:transparent!important}
    .cover{min-height:100svh;background:transparent!important;gap:12px}
    .ornament{font-size:30px;margin:0 0 8px}
    .eyebrow{margin:0;text-transform:uppercase}
    .cover h1{margin:0;max-width:330px}
    .cover-subtitle,.date,.venue,.text{max-width:330px;margin:0}
    .line{width:70px;height:1px;background:var(--accent);margin:8px}
    .button{display:inline-flex;align-items:center;justify-content:center;margin-top:18px;padding:13px 20px;border:1px solid var(--accent);border-radius:999px;text-decoration:none;cursor:pointer}
    .section{min-height:auto;padding-top:80px;padding-bottom:80px;gap:16px}
    .section + .section{border-top:0}
    .section h2{margin:0;max-width:330px}
    .couple-photo,.story-image{width:min(100%,320px);aspect-ratio:4/5;object-fit:cover;border-radius:160px 160px 18px 18px}
    .photo-placeholder{width:min(100%,320px);aspect-ratio:4/5;display:grid;place-items:center;border:1px dashed rgb(255 255 255 / 30%);border-radius:160px 160px 18px 18px;opacity:.6}
    .event-card,.dress-card{width:100%;padding:20px;border:1px solid rgb(255 255 255 / 15%);border-radius:18px;display:grid;gap:7px;text-align:center}
    .event-card a{color:var(--accent)}
    .countdown{display:grid;grid-template-columns:repeat(4,1fr);width:100%;gap:7px}
    .countdown div{padding:13px 5px;border:1px solid rgb(255 255 255 / 15%);border-radius:14px}
    .countdown strong{display:block;font-size:24px}
    .dress-grid{display:grid;grid-template-columns:1fr 1fr;width:100%;gap:10px}
    .rsvp-form{width:100%;display:grid;gap:12px}
    .rsvp-form label{display:grid;gap:6px}
    .rsvp-form input,.rsvp-form select,.rsvp-form textarea{width:100%;padding:12px;border:1px solid rgb(255 255 255 / 20%);border-radius:10px;background:rgb(255 255 255 / 8%);color:var(--text);font:inherit}
    .rsvp-form option{color:#111}
    .success{padding:14px;border:1px solid var(--accent);border-radius:12px;text-align:center}
    .closing{min-height:430px;background:transparent!important;position:relative;overflow:hidden}
    .closing img{width:100%;max-height:55svh;object-fit:cover;border-radius:22px;margin-bottom:22px}
    @media(min-width:700px){.phone{height:94svh;border-radius:28px;box-shadow:0 30px 90px rgb(0 0 0 / 40%)}}
  `

  return `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(title)}</title><style>${style}</style></head><body><main class="phone">
<section class="cover" style="${coverStyle}"><div class="ornament" style="${accentPaint}">✦</div><p class="eyebrow" style="${textStyle(labelText)}">${esc(c.eyebrow || '')}</p><h1 style="${textStyle(titleText)}">${esc(title)}</h1>${c.subtitle ? `<p class="cover-subtitle" style="${textStyle(subtitleText)}">${esc(c.subtitle)}</p>` : ''}<div class="line"></div>${c.date ? `<p class="date" style="${textStyle(smallText)}">${esc(c.date)}</p>` : ''}${c.venue ? `<p class="venue" style="${textStyle(smallText)}">${esc(c.venue)}</p>` : ''}<button class="button" style="${textStyle(buttonText)}" onclick="document.querySelector('#couple').scrollIntoView({behavior:'smooth'})">Abrir invitación</button></section>
<section class="section" id="couple">${couplePhoto}<p class="eyebrow" style="${textStyle(labelText)}">Con amor</p><h2 style="${textStyle(sectionText)}">${esc(displayName1)} <span style="${accentPaint}">${esc(displaySeparator)}</span> ${esc(displayName2)}</h2>${couple.quote ? `<p class="text" style="${textStyle(paragraphText)}">“${esc(couple.quote)}”</p>` : ''}</section>
${project.music?.enabled && project.music?.url ? `<section class="section"><p class="eyebrow" style="${textStyle(labelText)}">Nuestra canción</p><h2 style="${textStyle(sectionText)}">${esc(project.music.title || 'Una canción especial')}</h2><audio controls src="${esc(project.music.url)}"></audio></section>` : ''}
<section class="section"><p class="eyebrow" style="${textStyle(labelText)}">Nuestra historia</p><h2 style="${textStyle(sectionText)}">${esc(story.title || 'Nuestra historia')}</h2>${storyImage}<p class="text" style="${textStyle(paragraphText)}">${esc(story.text || 'Aquí comienza nuestra historia.')}</p></section>
<section class="section"><p class="eyebrow" style="${textStyle(labelText)}">El gran día</p><h2 style="${textStyle(sectionText)}">${event.date ? esc(new Date(`${event.date}T12:00:00`).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})) : 'Nuestra fecha'}</h2>${event.time ? `<p style="${textStyle(smallText)}">${esc(event.time)}</p>` : ''}<div class="event-card"><strong style="${textStyle(smallText)}">${esc(event.ceremonyTitle || 'Ceremonia')}</strong><span style="${textStyle(smallText)}">${esc(event.ceremonyVenue || 'Lugar de ceremonia')}</span><small style="${textStyle(smallText)}">${esc(event.ceremonyAddress || '')}</small>${event.ceremonyMapsUrl ? `<a href="${esc(event.ceremonyMapsUrl)}" target="_blank">Ver ubicación</a>` : ''}</div><div class="event-card"><strong style="${textStyle(smallText)}">${esc(event.receptionTitle || 'Recepción')}</strong><span style="${textStyle(smallText)}">${esc(event.receptionVenue || 'Lugar de recepción')}</span><small style="${textStyle(smallText)}">${esc(event.receptionAddress || '')}</small>${event.receptionMapsUrl ? `<a href="${esc(event.receptionMapsUrl)}" target="_blank">Ver ubicación</a>` : ''}</div></section>
${countdown.enabled && countdown.targetDate ? `<section class="section"><p class="eyebrow" style="${textStyle(labelText)}">La cuenta regresiva comienza</p><div class="countdown"><div><strong id="days">00</strong><span style="${textStyle(smallText)}">días</span></div><div><strong id="hours">00</strong><span style="${textStyle(smallText)}">horas</span></div><div><strong id="minutes">00</strong><span style="${textStyle(smallText)}">min</span></div><div><strong id="seconds">00</strong><span style="${textStyle(smallText)}">seg</span></div></div></section>` : ''}
${dress.enabled ? `<section class="section"><p class="eyebrow" style="${textStyle(labelText)}">Código de vestimenta</p><h2 style="${textStyle(sectionText)}">Elegancia para celebrar</h2><div class="dress-grid"><div class="dress-card"><span style="${textStyle(smallText)}">Ellas</span><strong style="${textStyle(smallText)}">${esc(dress.women || 'Por definir')}</strong></div><div class="dress-card"><span style="${textStyle(smallText)}">Ellos</span><strong style="${textStyle(smallText)}">${esc(dress.men || 'Por definir')}</strong></div></div>${dress.note ? `<p class="text" style="${textStyle(paragraphText)}">${esc(dress.note)}</p>` : ''}</section>` : ''}
${gifts.enabled ? `<section class="section"><p class="eyebrow" style="${textStyle(labelText)}">Un detalle especial</p><h2 style="${textStyle(sectionText)}">${esc(gifts.title || 'Mesa de regalos')}</h2><p class="text" style="${textStyle(paragraphText)}">${esc(gifts.message || 'Su presencia es nuestro mejor regalo.')}</p>${gifts.url ? `<a class="button" style="${textStyle(buttonText)}" href="${esc(gifts.url)}" target="_blank">${esc(gifts.buttonLabel || 'Ver información')}</a>` : ''}</section>` : ''}
${confirmation.enabled ? `<section class="section" id="confirmacion"><p class="eyebrow" style="${textStyle(labelText)}">Por favor</p><h2 style="${textStyle(sectionText)}">${esc(confirmation.title || 'Confirma tu asistencia')}</h2><p class="text" style="${textStyle(paragraphText)}">${esc(confirmation.message || 'Ayúdanos confirmando tu asistencia.')}</p><form class="rsvp-form" id="rsvp"><label style="${textStyle(smallText)}">Nombre<input name="name" required></label><label style="${textStyle(smallText)}">¿Asistirás?<select name="attendance" required><option value="">Selecciona</option><option>Sí asistiré</option><option>No podré asistir</option></select></label><label style="${textStyle(smallText)}">Número de invitados<input name="guests" type="number" min="1" max="20" value="1" required></label><label style="${textStyle(smallText)}">Mensaje (opcional)<textarea name="message" rows="3"></textarea></label><button class="button" style="${textStyle(buttonText)}" type="submit">${esc(confirmation.buttonLabel || 'Confirmar asistencia')}</button></form><div id="rsvp-success"></div></section>` : ''}
<section class="closing">${closing.image ? `<img src="${esc(closing.image)}" alt="Cierre">` : ''}<div class="ornament" style="${accentPaint}">✦</div><p class="text" style="${textStyle(paragraphText)}">${esc(closing.message || 'Gracias por ser parte de este momento.')}</p></section></main><script>const target=${JSON.stringify(countdown.targetDate || '')};if(target){const tick=()=>{const d=Math.max(0,new Date(target).getTime()-Date.now());const v=[Math.floor(d/86400000),Math.floor(d/3600000)%24,Math.floor(d/60000)%60,Math.floor(d/1000)%60];['days','hours','minutes','seconds'].forEach((id,i)=>{const e=document.getElementById(id);if(e)e.textContent=String(v[i]).padStart(2,'0')});};tick();setInterval(tick,1000)}document.getElementById('rsvp')?.addEventListener('submit',e=>{e.preventDefault();document.getElementById('rsvp-success').innerHTML='<div class="success">¡Gracias! Tu confirmación quedó registrada en este dispositivo.</div>';e.currentTarget.reset()})</script></body></html>`
}
