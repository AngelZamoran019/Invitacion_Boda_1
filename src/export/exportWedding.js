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
  const locationColor = /^#[0-9a-fA-F]{6}$/.test(String(event.locationColor || '')) ? String(event.locationColor) : '#ffffff'
  const countdown = project.countdown || {}
  const dress = project.dressCode || {}
  const gifts = project.gifts || {}
  const confirmation = project.confirmation || {}
  const closing = project.closing || {}

  const background = a.backgroundMode === 'gradient' && a.backgroundGradient ? a.backgroundGradient : a.backgroundColor || '#0b1730'
  const accent = a.accentMode === 'gradient' && a.accentGradient ? a.accentGradient : a.accentColor || '#c9a86a'
  const textColor = a.textColor || '#ffffff'
  const font = a.fontFamily || "'Playfair Display', serif"
  const title = c.title || 'Nombre & Nombre'
  const invitationNames = String(couple.displayNames || '').trim() || `${couple.name1 || 'Nombre'} ${couple.separator || 'y'} ${couple.name2 || 'Nombre'}`
  const displayName1 = invitationNames
  const displaySeparator = ''
  const displayName2 = ''

  const coverStyle = 'background:var(--bg);'
  const storyImage = story.images?.[0] ? `<img class="story-image" src="${esc(story.images[0])}" alt="Nuestra historia">` : ''
  const couplePhoto = couple.photo ? `<img class="couple-photo" src="${esc(couple.photo)}" alt="Los novios">` : '<div class="photo-placeholder">Foto de los novios</div>'
  const accentPaint = a.accentMode === 'gradient' && a.accentGradient
    ? `background:${esc(a.accentGradient)};-webkit-background-clip:text;background-clip:text;color:transparent;`
    : `color:${esc(a.accentColor || '#c9a86a')};`

  const style = `
    :root{--bg:${esc(background)};--accent:${esc(accent)};--text:${esc(textColor)};--font:${esc(font)}}
    *{box-sizing:border-box}
    html{width:100%;min-height:100%;margin:0;background:var(--bg)}
    body{width:100%;min-width:0;min-height:100%;margin:0;background:var(--bg);font-family:var(--font),Georgia,serif;color:var(--text);overflow-x:hidden}
    button,input,select,textarea{font:inherit;max-width:100%}
    img,video,audio{max-width:100%}
    .phone{position:relative;width:100%;max-width:430px;height:100dvh;min-height:100dvh;margin:0 auto;overflow-y:auto;overflow-x:hidden;background:var(--bg);background-color:var(--bg);scroll-behavior:smooth;-webkit-overflow-scrolling:touch;overscroll-behavior-x:none}
    .cover,.section,.closing{width:100%;max-width:100%;padding:clamp(34px,8vw,48px) clamp(18px,6vw,26px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:transparent!important}
    .cover{min-height:100dvh;gap:12px;padding-top:max(34px,env(safe-area-inset-top));padding-bottom:max(34px,env(safe-area-inset-bottom));}
    .ornament{font-size:clamp(24px,8vw,30px);margin:0 0 8px}
    .eyebrow{margin:0;text-transform:uppercase;max-width:100%;overflow-wrap:anywhere}
    .cover h1{margin:0;width:100%;max-width:330px;overflow-wrap:anywhere}
    .cover-subtitle,.date,.venue,.text{width:100%;max-width:330px;margin:0;overflow-wrap:anywhere}
    .line{width:70px;height:1px;flex:0 0 auto;background:var(--accent);margin:8px}
    .button{display:inline-flex;align-items:center;justify-content:center;max-width:100%;margin-top:18px;padding:13px 20px;border:1px solid var(--accent);border-radius:999px;text-decoration:none;cursor:pointer;text-align:center;white-space:normal;overflow-wrap:anywhere;touch-action:manipulation}
    .section{min-height:auto;padding-top:clamp(58px,14vw,80px);padding-bottom:clamp(58px,14vw,80px);gap:16px}
    .section + .section{border-top:0}
    .section h2{margin:0;width:100%;max-width:330px;overflow-wrap:anywhere}
    .couple-photo,.story-image{display:block;width:min(100%,320px);max-width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:160px 160px 18px 18px}
    .photo-placeholder{width:min(100%,320px);max-width:100%;aspect-ratio:4/5;display:grid;place-items:center;border:1px dashed rgb(255 255 255 / 30%);border-radius:160px 160px 18px 18px;opacity:.6;padding:20px}
    .event-card,.dress-card{width:100%;max-width:100%;padding:20px;border:1px solid rgb(255 255 255 / 15%);border-radius:18px;display:grid;gap:7px;text-align:center;overflow-wrap:anywhere}
    .event-card a{color:var(--accent);overflow-wrap:anywhere}
    .countdown{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));width:100%;gap:clamp(5px,2vw,7px)}
    .countdown div{min-width:0;padding:13px 4px;border:1px solid rgb(255 255 255 / 15%);border-radius:14px;overflow:hidden}
    .countdown strong{display:block;font-size:clamp(18px,6vw,24px);line-height:1.1}
    .countdown span{display:block;overflow-wrap:anywhere}
    .dress-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:100%;gap:10px}
    .rsvp-form{width:100%;max-width:100%;display:grid;gap:12px}
    .rsvp-form label{display:grid;gap:6px;min-width:0}
    .rsvp-form input,.rsvp-form select,.rsvp-form textarea{width:100%;max-width:100%;min-width:0;padding:12px;border:1px solid rgb(255 255 255 / 20%);border-radius:10px;background:rgb(255 255 255 / 8%);color:var(--text);font:inherit}
    .rsvp-form option{color:#111}
    .success{max-width:100%;padding:14px;border:1px solid var(--accent);border-radius:12px;text-align:center;overflow-wrap:anywhere}
    .closing{min-height:430px;background:transparent!important;position:relative;overflow:hidden}
    .closing img{display:block;width:100%;max-width:100%;max-height:55dvh;object-fit:cover;border-radius:22px;margin-bottom:22px}
    @media(max-width:360px){.cover,.section,.closing{padding-left:16px;padding-right:16px}.dress-grid{gap:7px}.countdown{gap:4px}.countdown div{padding-left:2px;padding-right:2px}.button{padding-left:16px;padding-right:16px}}
    @media(min-width:700px){html,body{min-height:100%;background:#101010}body{display:grid;place-items:center;padding:3vh 0}.phone{height:94dvh;min-height:620px;border-radius:28px;box-shadow:0 30px 90px rgb(0 0 0 / 40%)}}
  `

  return `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="${esc(a.backgroundColor || '#0b1730')}"><meta name="mobile-web-app-capable" content="yes"><title>${esc(title)}</title><style>${style}</style></head><body><main class="phone">
<section class="cover" style="${coverStyle}"><div class="ornament" style="${accentPaint}">✦</div><p class="eyebrow" style="${textStyle(labelText)}">${esc(c.eyebrow || '')}</p><h1 style="${textStyle(titleText)}">${esc(title)}</h1>${c.subtitle ? `<p class="cover-subtitle" style="${textStyle(subtitleText)}">${esc(c.subtitle)}</p>` : ''}<div class="line"></div>${c.date ? `<p class="date" style="${textStyle(smallText)}">${esc(c.date)}</p>` : ''}${c.venue ? `<p class="venue" style="${textStyle(smallText)}">${esc(c.venue)}</p>` : ''}<button class="button" style="${textStyle(buttonText)}" onclick="document.querySelector('#couple').scrollIntoView({behavior:'smooth'})">Abrir invitación</button></section>
<section class="section" id="couple">${couplePhoto}<p class="eyebrow" style="${textStyle(labelText)}">Con amor</p><h2 style="${textStyle(sectionText)}">${esc(displayName1)}</h2>${couple.quote ? `<p class="text" style="${textStyle(paragraphText)}">“${esc(couple.quote)}”</p>` : ''}</section>
${project.music?.enabled && project.music?.url ? `<section class="section"><p class="eyebrow" style="${textStyle(labelText)}">Nuestra canción</p><h2 style="${textStyle(sectionText)}">${esc(project.music.title || 'Una canción especial')}</h2><audio controls src="${esc(project.music.url)}"></audio></section>` : ''}
<section class="section"><p class="eyebrow" style="${textStyle(labelText)}">Nuestra historia</p><h2 style="${textStyle(sectionText)}">${esc(story.title || 'Nuestra historia')}</h2>${storyImage}<p class="text" style="${textStyle(paragraphText)}">${esc(story.text || 'Aquí comienza nuestra historia.')}</p></section>
<section class="section"><p class="eyebrow" style="${textStyle(labelText)}">El gran día</p><h2 style="${textStyle(sectionText)}">${event.date ? esc(new Date(`${event.date}T12:00:00`).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})) : 'Nuestra fecha'}</h2>${event.time ? `<p style="${textStyle(smallText)}">${esc(event.time)}</p>` : ''}<div class="event-card"><strong style="${textStyle(smallText)}">${esc(event.ceremonyTitle || 'Ceremonia')}</strong><span style="${textStyle(smallText)}">${esc(event.ceremonyVenue || 'Lugar de ceremonia')}</span><small style="${textStyle(smallText)}">${esc(event.ceremonyAddress || '')}</small>${event.ceremonyMapsUrl ? `<a href="${esc(event.ceremonyMapsUrl)}" target="_blank" rel="noopener noreferrer" style="color:${esc(locationColor)} !important;-webkit-text-fill-color:${esc(locationColor)} !important;">Ver ubicación</a>` : ''}</div><div class="event-card"><strong style="${textStyle(smallText)}">${esc(event.receptionTitle || 'Recepción')}</strong><span style="${textStyle(smallText)}">${esc(event.receptionVenue || 'Lugar de recepción')}</span><small style="${textStyle(smallText)}">${esc(event.receptionAddress || '')}</small>${event.receptionMapsUrl ? `<a href="${esc(event.receptionMapsUrl)}" target="_blank" rel="noopener noreferrer" style="color:${esc(locationColor)} !important;-webkit-text-fill-color:${esc(locationColor)} !important;">Ver ubicación</a>` : ''}</div></section>
${countdown.enabled ? `<section class="section"><p class="eyebrow" style="${textStyle(labelText)}">La cuenta regresiva comienza</p><div class="countdown"><div><strong id="days">00</strong><span style="${textStyle(smallText)}">días</span></div><div><strong id="hours">00</strong><span style="${textStyle(smallText)}">horas</span></div><div><strong id="minutes">00</strong><span style="${textStyle(smallText)}">min</span></div><div><strong id="seconds">00</strong><span style="${textStyle(smallText)}">seg</span></div></div></section>` : ''}
${dress.enabled ? `<section class="section"><p class="eyebrow" style="${textStyle(labelText)}">${esc(dress.sectionTitle ?? 'Código de vestimenta')}</p><h2 style="${textStyle(sectionText)}">${esc(dress.subtitle ?? 'Elegancia para celebrar')}</h2><div class="dress-grid"><div class="dress-card"><span style="${textStyle(smallText)}">${esc(dress.menLabel ?? 'Hombres')}</span><strong style="${textStyle(smallText)}">${esc(dress.menAttire ?? dress.men ?? 'Por definir')}</strong></div><div class="dress-card"><span style="${textStyle(smallText)}">${esc(dress.womenLabel ?? 'Mujeres')}</span><strong style="${textStyle(smallText)}">${esc(dress.womenAttire ?? dress.women ?? 'Por definir')}</strong></div></div>${dress.note ? `<p class="text" style="${textStyle(paragraphText)}">${esc(dress.note)}</p>` : ''}</section>` : ''}
${gifts.enabled ? `<section class="section"><p class="eyebrow" style="${textStyle(labelText)}">Un detalle especial</p><h2 style="${textStyle(sectionText)}">${esc(gifts.title || 'Mesa de regalos')}</h2><p class="text" style="${textStyle(paragraphText)}">${esc(gifts.message || 'Su presencia es nuestro mejor regalo.')}</p>${gifts.url ? `<a class="button" style="${textStyle(buttonText)}" href="${esc(gifts.url)}" target="_blank" rel="noopener noreferrer">${esc(gifts.buttonLabel || 'Ver información')}</a>` : ''}</section>` : ''}
${confirmation.enabled ? `<section class="section" id="confirmacion"><p class="eyebrow" style="${textStyle(labelText)}">${esc(confirmation.sectionTitle || 'Por favor')}</p><h2 style="${textStyle(sectionText)}">${esc(confirmation.subtitle || confirmation.title || 'Confirma tu asistencia')}</h2><p class="text" style="${textStyle(paragraphText)}">${esc(confirmation.message || 'Ayúdanos confirmando tu asistencia.')}</p><form class="rsvp-form" id="rsvp"><label class="rsvp-label rsvp-name-label">${esc(confirmation.nameLabel || 'Nombre')}<input name="name" required></label><label class="rsvp-label rsvp-attendance-label">${esc(confirmation.attendanceLabel || '¿Asistiras?')}<select name="attendance" required><option value="">Selecciona</option><option>Sí asistiré</option><option>No podré asistir</option></select></label><label class="rsvp-label rsvp-guests-label">${esc(confirmation.guestsLabel || 'Numero de invitados')}<input name="guests" type="number" min="1" max="20" value="1" required></label><label class="rsvp-label rsvp-message-label">${esc(confirmation.messageFieldLabel || 'Mensaje (Opcional)')}<textarea name="message" rows="3"></textarea></label><button class="button" style="${textStyle(buttonText)}" type="submit">${esc(confirmation.buttonLabel || 'Confirmar asistencia')}</button></form><div id="rsvp-success"></div></section>` : ''}
<section class="closing">${closing.image ? `<img src="${esc(closing.image)}" alt="Cierre">` : ''}<div class="ornament" style="${accentPaint}">✦</div><p class="text" style="${textStyle(paragraphText)}">${esc(closing.message || 'Gracias por ser parte de este momento.')}</p></section></main><script>const target=${JSON.stringify(countdown.targetDate || '')};if(target){const tick=()=>{const d=Math.max(0,new Date(target).getTime()-Date.now());const v=[Math.floor(d/86400000),Math.floor(d/3600000)%24,Math.floor(d/60000)%60,Math.floor(d/1000)%60];['days','hours','minutes','seconds'].forEach((id,i)=>{const e=document.getElementById(id);if(e)e.textContent=String(v[i]).padStart(2,'0')});};tick();setInterval(tick,1000)}document.getElementById('rsvp')?.addEventListener('submit',e=>{e.preventDefault();document.getElementById('rsvp-success').innerHTML='<div class="success">¡Gracias! Tu confirmación quedó registrada en este dispositivo.</div>';e.currentTarget.reset()})</script></body></html>`
}
