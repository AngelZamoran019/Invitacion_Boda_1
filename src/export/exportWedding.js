const esc = (value = '') => String(value).replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[char]))

export function buildWeddingHTML(project) {
  const a = project.appearance
  const c = project.coverSection
  const couple = project.couple
  const story = project.story
  const event = project.event
  const countdown = project.countdown
  const dress = project.dressCode
  const gifts = project.gifts
  const confirmation = project.confirmation
  const closing = project.closing
  const title = c.title || `${couple.name1 || 'Nombre'} & ${couple.name2 || 'Nombre'}`
  const coverStyle = c.backgroundImage ? `background-image:linear-gradient(rgb(5 12 28 / 55%),rgb(5 12 28 / 88%)),url('${esc(c.backgroundImage)}')` : ''
  const storyImage = story.images?.[0] ? `<img class="story-image" src="${esc(story.images[0])}" alt="Nuestra historia">` : ''
  const couplePhoto = couple.photo ? `<img class="couple-photo" src="${esc(couple.photo)}" alt="Los novios">` : '<div class="photo-placeholder">Foto de los novios</div>'

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<style>
:root{--bg:${esc(a.backgroundColor)};--accent:${esc(a.accentColor)};--text:${esc(a.textColor)};--font:${esc(a.fontFamily)}}*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#111;font-family:var(--font),Georgia,serif;color:var(--text)}body{display:grid;place-items:center}.phone{width:min(100vw,430px);height:100svh;min-height:620px;overflow-y:auto;overflow-x:hidden;background:var(--bg);scroll-behavior:smooth;scrollbar-width:none}.phone::-webkit-scrollbar{display:none}.cover,.section,.closing{width:100%;min-height:100svh;padding:48px 26px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.cover{background-size:cover;background-position:center;gap:12px}.ornament{font-size:28px;color:var(--accent)}.eyebrow{margin:0;color:var(--accent);font:700 11px/1.4 system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}.cover h1{margin:0;font-size:clamp(40px,12vw,62px);line-height:1.02;font-weight:500}.cover-subtitle,.date,.venue,.text{max-width:330px;line-height:1.7;opacity:.9}.line{width:70px;height:1px;background:var(--accent);margin:8px}.button{display:inline-flex;align-items:center;justify-content:center;margin-top:18px;padding:13px 20px;border:1px solid var(--accent);border-radius:999px;background:transparent;color:var(--text);text-decoration:none;cursor:pointer}.section{min-height:auto;padding-top:80px;padding-bottom:80px;gap:16px}.section h2{margin:0;font-size:32px;font-weight:500}.couple-photo,.story-image{width:min(100%,320px);aspect-ratio:4/5;object-fit:cover;border-radius:160px 160px 18px 18px}.photo-placeholder{width:min(100%,320px);aspect-ratio:4/5;display:grid;place-items:center;border:1px dashed rgb(255 255 255 / 30%);border-radius:160px 160px 18px 18px;opacity:.6}.event-card,.dress-card{width:100%;padding:20px;border:1px solid rgb(255 255 255 / 15%);border-radius:18px;display:grid;gap:7px;text-align:center}.event-card a{color:var(--accent)}.countdown{display:grid;grid-template-columns:repeat(4,1fr);width:100%;gap:7px}.countdown div{padding:13px 5px;border:1px solid rgb(255 255 255 / 15%);border-radius:14px}.countdown strong{display:block;font-size:24px}.countdown span{font:10px system-ui,sans-serif;opacity:.7}.dress-grid{display:grid;grid-template-columns:1fr 1fr;width:100%;gap:10px}.rsvp-form{width:100%;display:grid;gap:12px;text-align:left}.rsvp-form label{display:grid;gap:6px;font:700 12px system-ui,sans-serif}.rsvp-form input,.rsvp-form select,.rsvp-form textarea{width:100%;padding:12px;border:1px solid rgb(255 255 255 / 20%);border-radius:10px;background:rgb(255 255 255 / 8%);color:var(--text)}.rsvp-form option{color:#111}.success{padding:14px;border:1px solid var(--accent);border-radius:12px;text-align:center}.closing{background:var(--bg)}.closing img{width:100%;max-height:55svh;object-fit:cover;border-radius:22px;margin-bottom:22px}@media(min-width:700px){.phone{height:94svh;border-radius:28px;box-shadow:0 30px 90px rgb(0 0 0 / 40%)}}
</style>
</head>
<body>
<main class="phone">
<section class="cover" style="${coverStyle}"><div class="ornament">✦</div><p class="eyebrow">${esc(c.eyebrow)}</p><h1>${esc(title)}</h1>${c.subtitle ? `<p class="cover-subtitle">${esc(c.subtitle)}</p>` : ''}<div class="line"></div>${c.date ? `<p class="date">${esc(c.date)}</p>` : ''}${c.venue ? `<p class="venue">${esc(c.venue)}</p>` : ''}<button class="button" onclick="document.querySelector('#couple').scrollIntoView({behavior:'smooth'})">Abrir invitación</button></section>
<section class="section" id="couple">${couplePhoto}<p class="eyebrow">Con amor</p><h2>${esc(couple.name1 || 'Nombre')} & ${esc(couple.name2 || 'Nombre')}</h2>${couple.quote ? `<p class="text">“${esc(couple.quote)}”</p>` : ''}</section>
${project.music.enabled && project.music.url ? `<section class="section"><p class="eyebrow">Nuestra canción</p><h2>${esc(project.music.title || 'Una canción especial')}</h2><audio controls src="${esc(project.music.url)}"></audio></section>` : ''}
<section class="section"><p class="eyebrow">Nuestra historia</p><h2>${esc(story.title)}</h2>${storyImage}<p class="text">${esc(story.text || 'Aquí comienza nuestra historia.')}</p></section>
<section class="section"><p class="eyebrow">El gran día</p><h2>${event.date ? esc(new Date(`${event.date}T12:00:00`).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})) : 'Nuestra fecha'}</h2>${event.time ? `<p>${esc(event.time)}</p>` : ''}<div class="event-card"><strong>${esc(event.ceremonyTitle)}</strong><span>${esc(event.ceremonyVenue || 'Lugar de ceremonia')}</span><small>${esc(event.ceremonyAddress || '')}</small>${event.ceremonyMapsUrl ? `<a href="${esc(event.ceremonyMapsUrl)}" target="_blank">Ver ubicación</a>` : ''}</div><div class="event-card"><strong>${esc(event.receptionTitle)}</strong><span>${esc(event.receptionVenue || 'Lugar de recepción')}</span><small>${esc(event.receptionAddress || '')}</small>${event.receptionMapsUrl ? `<a href="${esc(event.receptionMapsUrl)}" target="_blank">Ver ubicación</a>` : ''}</div></section>
${countdown.enabled && countdown.targetDate ? `<section class="section"><p class="eyebrow">La cuenta regresiva comienza</p><div class="countdown"><div><strong id="days">00</strong><span>días</span></div><div><strong id="hours">00</strong><span>horas</span></div><div><strong id="minutes">00</strong><span>min</span></div><div><strong id="seconds">00</strong><span>seg</span></div></div></section>` : ''}
${dress.enabled ? `<section class="section"><p class="eyebrow">Código de vestimenta</p><h2>Elegancia para celebrar</h2><div class="dress-grid"><div class="dress-card"><span>Ellas</span><strong>${esc(dress.women || 'Por definir')}</strong></div><div class="dress-card"><span>Ellos</span><strong>${esc(dress.men || 'Por definir')}</strong></div></div>${dress.note ? `<p class="text">${esc(dress.note)}</p>` : ''}</section>` : ''}
${gifts.enabled ? `<section class="section"><p class="eyebrow">Un detalle especial</p><h2>${esc(gifts.title)}</h2><p class="text">${esc(gifts.message || 'Su presencia es nuestro mejor regalo.')}</p>${gifts.url ? `<a class="button" href="${esc(gifts.url)}" target="_blank">${esc(gifts.buttonLabel)}</a>` : ''}</section>` : ''}
${confirmation.enabled ? `<section class="section" id="confirmacion"><p class="eyebrow">Por favor</p><h2>${esc(confirmation.title)}</h2><p class="text">${esc(confirmation.message || 'Ayúdanos confirmando tu asistencia.')}</p><form class="rsvp-form" id="rsvp"><label>Nombre<input name="name" required></label><label>¿Asistirás?<select name="attendance" required><option value="">Selecciona</option><option value="Sí asistiré">Sí asistiré</option><option value="No podré asistir">No podré asistir</option></select></label><label>Número de invitados<input name="guests" type="number" min="1" max="20" value="1" required></label><label>Mensaje (opcional)<textarea name="message" rows="3"></textarea></label><button class="button" type="submit">${esc(confirmation.buttonLabel)}</button></form><div id="rsvp-success"></div></section>` : ''}
<section class="closing">${closing.image ? `<img src="${esc(closing.image)}" alt="Cierre">` : ''}<div class="ornament">✦</div><p class="text">${esc(closing.message || 'Gracias por ser parte de este momento.')}</p></section>
</main>
<script>
const target=${JSON.stringify(countdown.targetDate || '')};if(target){const tick=()=>{const d=Math.max(0,new Date(target).getTime()-Date.now());const vals=[Math.floor(d/86400000),Math.floor(d/3600000)%24,Math.floor(d/60000)%60,Math.floor(d/1000)%60];['days','hours','minutes','seconds'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=String(vals[i]).padStart(2,'0')})};tick();setInterval(tick,1000)}
document.getElementById('rsvp')?.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));const key='wedding-rsvp-${esc(project.id || 'project')}';const list=JSON.parse(localStorage.getItem(key)||'[]');list.push({...data,submittedAt:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(list));e.currentTarget.innerHTML='<div class="success">¡Gracias! Tu confirmación quedó registrada en este dispositivo.</div>'})
</script>
</body></html>`
}

export function exportWeddingHTML(project) {
  const html = buildWeddingHTML(project)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${(project.coverSection.title || project.name || 'invitacion-boda').replace(/[^a-z0-9áéíóúüñ &_-]/gi, '').replace(/\s+/g, '-').toLowerCase()}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
