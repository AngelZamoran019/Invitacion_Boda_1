const MAX_HTML_BYTES = 10 * 1024 * 1024
const TOKEN_BYTES = 24
const SESSION_TTL = 12 * 60 * 60 * 1000
const PBKDF2_ITERATIONS = 100000
const encoder = new TextEncoder()

const getAllowedOrigin = (request, env) => {
  const requestOrigin = request.headers.get('Origin') || ''
  const configured = String(env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean)
  if (!configured.length) return '*'
  return configured.includes(requestOrigin) ? requestOrigin : ''
}

const corsHeaders = (request, env) => {
  const origin = getAllowedOrigin(request, env)
  const headers = { 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '86400' }
  if (origin) headers['Access-Control-Allow-Origin'] = origin
  return headers
}

const json = (request, env, body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...corsHeaders(request, env) },
})

const createToken = () => {
  const bytes = new Uint8Array(TOKEN_BYTES)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const safeToken = (value) => String(value || '').match(/^[a-f0-9]{48}$/i)?.[0] || null
const safeId = (value) => String(value || '').match(/^[a-f0-9]{48}$/i)?.[0] || null
const normalizeName = (value) => String(value || '').trim().toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ')

const r2Json = async (env, key) => {
  const object = await env.PUBLICATIONS.get(key)
  if (!object) return null
  try { return await object.json() } catch { return null }
}

const putJson = async (env, key, value) => env.PUBLICATIONS.put(key, JSON.stringify(value), {
  httpMetadata: { contentType: 'application/json; charset=utf-8', cacheControl: 'no-store' },
})

const deleteObject = async (env, key) => env.PUBLICATIONS.delete(key)

const getPublicUrl = (request, env, token) => {
  const configuredBase = String(env.PUBLIC_BASE_URL || '').trim().replace(/\/$/, '')
  const base = configuredBase || new URL(request.url).origin
  return `${base}/i/${token}`
}

const addLimitedWatermark = (html) => {
  const watermark = `<style id="dangels-print-studio-watermark">.dangels-print-studio-watermark{position:fixed;inset:0;z-index:2147483647;pointer-events:none;overflow:hidden;display:block}.dangels-print-studio-watermark::before{content:"Dangels Print Studio     Dangels Print Studio     Dangels Print Studio     Dangels Print Studio     Dangels Print Studio     Dangels Print Studio";position:absolute;inset:-30%;width:160%;height:160%;display:block;font:700 18px/1.2 Arial,sans-serif;letter-spacing:2px;color:rgba(255,255,255,.16);text-align:center;transform:rotate(-28deg);word-spacing:30px;white-space:pre-wrap;background-image:repeating-linear-gradient(0deg,transparent 0,transparent 80px,rgba(255,255,255,.02) 81px,transparent 82px)}</style>`
  const layer = '<div class="dangels-print-studio-watermark" aria-hidden="true"></div>'
  const withStyle = /<\/head>/i.test(html) ? html.replace(/<\/head>/i, `${watermark}</head>`) : `${watermark}${html}`
  return /<\/body>/i.test(withStyle) ? withStyle.replace(/<\/body>/i, `${layer}</body>`) : `${withStyle}${layer}`
}

const hashPassword = async (password, saltBytes) => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256)
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const createPasswordHash = async (password) => {
  const salt = new Uint8Array(16)
  crypto.getRandomValues(salt)
  const hash = await hashPassword(password, salt)
  return `${Array.from(salt, (byte) => byte.toString(16).padStart(2, '0')).join('')}:${hash}`
}

const verifyPassword = async (password, stored) => {
  const [saltHex, expected] = String(stored || '').split(':')
  if (!saltHex || !expected || saltHex.length !== 32 || expected.length !== 64) return false
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map((value) => Number.parseInt(value, 16)))
  const actual = await hashPassword(password, salt)
  const actualBytes = encoder.encode(actual)
  const expectedBytes = encoder.encode(expected)
  if (actualBytes.length !== expectedBytes.length) return false
  return crypto.subtle.timingSafeEqual(actualBytes, expectedBytes)
}

const readEntries = async (env, spaceId) => {
  const entries = []
  let cursor
  do {
    const page = await env.PUBLICATIONS.list({ prefix: `guest/entries/${spaceId}/`, limit: 1000, cursor })
    for (const object of page.objects) {
      const entry = await r2Json(env, object.key)
      if (entry) entries.push(entry)
    }
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  return entries.sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

const buildGuestPayload = async (env, space) => {
  const entries = await readEntries(env, space.spaceId)
  const confirmedGuests = entries.filter((entry) => entry.attendance === 'yes').reduce((sum, entry) => sum + Number(entry.guests || 0), 0)
  const pendingGuests = entries.filter((entry) => !entry.attendance).reduce((sum, entry) => sum + Number(entry.guests || 0), 0)
  return { title: space.title, entries, confirmedGuests, pendingGuests }
}

const createSession = async (env, spaceId, type) => {
  const token = createToken()
  await putJson(env, `guest/sessions/${token}.json`, { spaceId, type, expiresAt: Date.now() + SESSION_TTL })
  return token
}

const requireSession = async (request, env, token, type) => {
  const sessionToken = String(request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  const session = await r2Json(env, `guest/sessions/${safeToken(sessionToken) || 'invalid'}.json`)
  if (!session || session.type !== type || session.token !== token || Number(session.expiresAt) < Date.now()) return null
  return session
}

const createPanel = async (request, env) => {
  const payload = await request.json()
  const projectId = String(payload?.projectId || '').trim()
  const title = String(payload?.title || 'Invitación de boda').trim().slice(0, 200)
  const password = String(payload?.password || '')
  if (!projectId || password.length < 4) return json(request, env, { error: 'Proyecto o contraseña inválidos.' }, 400)

  const projectKey = `guest/projects/${encodeURIComponent(projectId)}.json`
  const existing = await r2Json(env, projectKey)
  const spaceId = existing?.spaceId || createToken()
  const panelToken = createToken()
  const space = { spaceId, projectId, title, panelToken, baseToken: existing?.baseToken || null, panelPasswordHash: await createPasswordHash(password), basePasswordHash: existing?.basePasswordHash || null, createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }
  await putJson(env, `guest/spaces/${spaceId}.json`, space)
  await putJson(env, projectKey, { spaceId })
  await putJson(env, `guest/panels/${panelToken}.json`, { spaceId })
  return json(request, env, { ok: true, token: panelToken, url: `${new URL(request.url).origin}/control/panel/${panelToken}` }, 201)
}

const createBase = async (request, env) => {
  const payload = await request.json()
  const panelToken = safeToken(payload?.panelToken)
  const password = String(payload?.password || '')
  if (!panelToken || password.length < 4) return json(request, env, { error: 'Panel o contraseña inválidos.' }, 400)
  const panelIndex = await r2Json(env, `guest/panels/${panelToken}.json`)
  if (!panelIndex) return json(request, env, { error: 'Primero genera el Panel para este proyecto.' }, 404)
  const space = await r2Json(env, `guest/spaces/${panelIndex.spaceId}.json`)
  if (!space) return json(request, env, { error: 'No se encontró la configuración del proyecto.' }, 404)
  const baseToken = createToken()
  const updated = { ...space, baseToken, basePasswordHash: await createPasswordHash(password), updatedAt: new Date().toISOString() }
  await putJson(env, `guest/spaces/${space.spaceId}.json`, updated)
  await putJson(env, `guest/bases/${baseToken}.json`, { spaceId: space.spaceId })
  return json(request, env, { ok: true, token: baseToken, url: `${new URL(request.url).origin}/control/base/${baseToken}` }, 201)
}

const loginGuestArea = async (request, env, type, token) => {
  const safe = safeToken(token)
  if (!safe || (type !== 'panel' && type !== 'base')) return json(request, env, { error: 'Enlace inválido.' }, 404)
  const index = await r2Json(env, `guest/${type === 'panel' ? 'panels' : 'bases'}/${safe}.json`)
  if (!index) return json(request, env, { error: 'Enlace no encontrado.' }, 404)
  const space = await r2Json(env, `guest/spaces/${index.spaceId}.json`)
  if (!space) return json(request, env, { error: 'No se encontró la base del proyecto.' }, 404)
  const payload = await request.json()
  const valid = await verifyPassword(String(payload?.password || ''), type === 'panel' ? space.panelPasswordHash : space.basePasswordHash)
  if (!valid) return json(request, env, { error: 'Contraseña incorrecta.' }, 401)
  const session = await createSession(env, space.spaceId, type)
  await putJson(env, `guest/sessions/${session}.json`, { spaceId: space.spaceId, type, token: safe, expiresAt: Date.now() + SESSION_TTL })
  return json(request, env, { ...(await buildGuestPayload(env, space)), session, expiresAt: Date.now() + SESSION_TTL })
}

const getGuestEntries = async (request, env, type, token) => {
  const session = await requireSession(request, env, token, type)
  if (!session) return json(request, env, { error: 'Sesión expirada. Ingresa de nuevo.' }, 401)
  const space = await r2Json(env, `guest/spaces/${session.spaceId}.json`)
  if (!space) return json(request, env, { error: 'Base no encontrada.' }, 404)
  return json(request, env, await buildGuestPayload(env, space))
}

const requirePanelSpace = async (request, env, token) => {
  const session = await requireSession(request, env, token, 'panel')
  if (!session) return null
  const space = await r2Json(env, `guest/spaces/${session.spaceId}.json`)
  return space || null
}

const sanitizeEntry = (payload) => ({ name: String(payload?.name || '').trim().slice(0, 160), guests: Math.max(1, Math.min(99, Number(payload?.guests) || 1)) })

const addGuestEntry = async (request, env, token) => {
  const space = await requirePanelSpace(request, env, token)
  if (!space) return json(request, env, { error: 'Sesión expirada. Ingresa de nuevo.' }, 401)
  const entry = sanitizeEntry(await request.json())
  if (!entry.name) return json(request, env, { error: 'El nombre es obligatorio.' }, 400)
  const existing = await readEntries(env, space.spaceId)
  if (existing.some((item) => normalizeName(item.name) === normalizeName(entry.name))) return json(request, env, { error: 'Ese nombre ya existe en la lista.' }, 409)
  const id = createToken()
  await putJson(env, `guest/entries/${space.spaceId}/${id}.json`, { id, ...entry, attendance: null, message: '', updatedAt: new Date().toISOString() })
  return json(request, env, await buildGuestPayload(env, space), 201)
}

const updateGuestEntry = async (request, env, token, id) => {
  const space = await requirePanelSpace(request, env, token)
  const safe = safeId(id)
  if (!space || !safe) return json(request, env, { error: 'Sesión expirada o invitado inválido.' }, 401)
  const key = `guest/entries/${space.spaceId}/${safe}.json`
  const current = await r2Json(env, key)
  if (!current) return json(request, env, { error: 'Invitado no encontrado.' }, 404)
  const entry = sanitizeEntry(await request.json())
  if (!entry.name) return json(request, env, { error: 'El nombre es obligatorio.' }, 400)
  await putJson(env, key, { ...current, ...entry, updatedAt: new Date().toISOString() })
  return json(request, env, await buildGuestPayload(env, space))
}

const deleteGuestEntry = async (request, env, token, id) => {
  const space = await requirePanelSpace(request, env, token)
  const safe = safeId(id)
  if (!space || !safe) return json(request, env, { error: 'Sesión expirada o invitado inválido.' }, 401)
  await deleteObject(env, `guest/entries/${space.spaceId}/${safe}.json`)
  return json(request, env, await buildGuestPayload(env, space))
}

const submitRsvp = async (request, env, baseToken) => {
  const safe = safeToken(baseToken)
  if (!safe) return json(request, env, { error: 'Base inválida.' }, 404)
  const index = await r2Json(env, `guest/bases/${safe}.json`)
  if (!index) return json(request, env, { error: 'Base no encontrada.' }, 404)
  const space = await r2Json(env, `guest/spaces/${index.spaceId}.json`)
  if (!space) return json(request, env, { error: 'Proyecto no encontrado.' }, 404)
  const payload = await request.json()
  const name = String(payload?.name || '').trim()
  const attendanceRaw = String(payload?.attendance || '').toLowerCase()
  const attendance = attendanceRaw.includes('no') ? 'no' : attendanceRaw.includes('sí') || attendanceRaw.includes('si') || attendanceRaw === 'yes' ? 'yes' : ''
  const message = String(payload?.message || '').trim().slice(0, 1000)
  if (!name || !attendance) return json(request, env, { error: 'Nombre y asistencia son obligatorios.' }, 400)
  const entries = await readEntries(env, space.spaceId)
  const matches = entries.filter((entry) => normalizeName(entry.name) === normalizeName(name))
  if (matches.length !== 1) return json(request, env, { error: matches.length ? 'Hay más de un invitado con ese nombre. Especifica el nombre tal como aparece en la invitación.' : 'No encontramos ese nombre en la lista de invitados.' }, 404)
  const current = matches[0]
  const submittedGuests = Math.max(1, Math.min(Number(current.guests) || 1, Number(payload?.guests) || Number(current.guests) || 1))
  await putJson(env, `guest/entries/${space.spaceId}/${current.id}.json`, { ...current, attendance, guests: attendance === 'yes' ? submittedGuests : current.guests, message, updatedAt: new Date().toISOString() })
  return json(request, env, { ok: true, message: 'Confirmación registrada.' })
}

const handlePublish = async (request, env) => {
  let payload
  try { payload = await request.json() } catch { return json(request, env, { error: 'Solicitud inválida.' }, 400) }
  const mode = payload?.mode
  if (mode !== 'free' && mode !== 'limited') return json(request, env, { error: 'Tipo de publicación no válido.' }, 400)
  const html = String(payload?.html || '')
  if (!html || html.length > MAX_HTML_BYTES) return json(request, env, { error: `El HTML debe tener entre 1 y ${MAX_HTML_BYTES} bytes.` }, 413)
  const token = createToken()
  const publishedHtml = mode === 'limited' ? addLimitedWatermark(html) : html
  await env.PUBLICATIONS.put(`publications/${token}.html`, publishedHtml, { httpMetadata: { contentType: 'text/html; charset=utf-8', cacheControl: 'public, max-age=31536000, immutable' }, customMetadata: { mode, projectId: String(payload?.projectId || ''), title: String(payload?.title || 'Invitación de boda').slice(0, 200), createdAt: new Date().toISOString() } })
  return json(request, env, { ok: true, mode, token, url: getPublicUrl(request, env, token) }, 201)
}

const handlePublication = async (request, env, token) => {
  const safe = safeToken(token)
  if (!safe) return new Response('No encontrado', { status: 404 })
  const object = await env.PUBLICATIONS.get(`publications/${safe}.html`)
  if (!object) return new Response('No encontrado', { status: 404 })
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('Content-Type', 'text/html; charset=utf-8')
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Content-Security-Policy', "frame-ancestors 'none'")
  return new Response(object.body, { headers })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) })
    try {
      if (request.method === 'POST' && url.pathname === '/api/publish') return await handlePublish(request, env)
      if (request.method === 'GET' && url.pathname.startsWith('/i/')) return handlePublication(request, env, url.pathname.slice(3))
      if (request.method === 'POST' && url.pathname === '/api/guest/panel') return createPanel(request, env)
      if (request.method === 'POST' && url.pathname === '/api/guest/base') return createBase(request, env)
      const loginMatch = url.pathname.match(/^\/api\/guest\/(panel|base)\/([a-f0-9]{48})\/login$/i)
      if (request.method === 'POST' && loginMatch) return loginGuestArea(request, env, loginMatch[1].toLowerCase(), loginMatch[2])
      const entriesMatch = url.pathname.match(/^\/api\/guest\/(panel|base)\/([a-f0-9]{48})\/entries$/i)
      if (request.method === 'GET' && entriesMatch) return getGuestEntries(request, env, entriesMatch[1].toLowerCase(), entriesMatch[2])
      const createMatch = url.pathname.match(/^\/api\/guest\/panel\/([a-f0-9]{48})\/entries$/i)
      if (request.method === 'POST' && createMatch) return addGuestEntry(request, env, createMatch[1])
      const entryMatch = url.pathname.match(/^\/api\/guest\/panel\/([a-f0-9]{48})\/entries\/([a-f0-9]{48})$/i)
      if (entryMatch && request.method === 'PUT') return updateGuestEntry(request, env, entryMatch[1], entryMatch[2])
      if (entryMatch && request.method === 'DELETE') return deleteGuestEntry(request, env, entryMatch[1], entryMatch[2])
      const rsvpMatch = url.pathname.match(/^\/api\/guest\/rsvp\/([a-f0-9]{48})$/i)
      if (request.method === 'POST' && rsvpMatch) return submitRsvp(request, env, rsvpMatch[1])
      return new Response('Invitaciones Digitales · Worker activo', { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    } catch (error) {
      console.error('Worker error', error)
      return json(request, env, { error: 'No se pudo completar la operación.' }, 500)
    }
  },
}
