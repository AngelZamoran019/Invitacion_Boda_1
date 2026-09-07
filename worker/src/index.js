const MAX_HTML_BYTES = 10 * 1024 * 1024
const TOKEN_BYTES = 18

const getAllowedOrigin = (request, env) => {
  const requestOrigin = request.headers.get('Origin') || ''
  const configured = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!configured.length) return '*'
  return configured.includes(requestOrigin) ? requestOrigin : ''
}

const corsHeaders = (request, env) => {
  const origin = getAllowedOrigin(request, env)
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
  if (origin) headers['Access-Control-Allow-Origin'] = origin
  return headers
}

const json = (request, env, body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders(request, env),
  },
})

const createToken = () => {
  const bytes = new Uint8Array(TOKEN_BYTES)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const getPublicUrl = (request, env, token) => {
  const configuredBase = String(env.PUBLIC_BASE_URL || '').trim().replace(/\/$/, '')
  const base = configuredBase || new URL(request.url).origin
  return `${base}/i/${token}`
}

const addLimitedWatermark = (html) => {
  const watermark = `
<style id="dangels-print-studio-watermark">
  .dangels-print-studio-watermark{position:fixed;inset:0;z-index:2147483647;pointer-events:none;overflow:hidden;display:block;}
  .dangels-print-studio-watermark::before{content:"Dangels Print Studio     Dangels Print Studio     Dangels Print Studio     Dangels Print Studio     Dangels Print Studio     Dangels Print Studio";position:absolute;inset:-30%;width:160%;height:160%;display:block;font:700 18px/1.2 Arial,sans-serif;letter-spacing:2px;color:rgba(255,255,255,.16);text-align:center;transform:rotate(-28deg);word-spacing:30px;white-space:pre-wrap;background-image:repeating-linear-gradient(0deg,transparent 0,transparent 80px,rgba(255,255,255,.02) 81px,transparent 82px);}
</style>`
  const layer = '<div class="dangels-print-studio-watermark" aria-hidden="true"></div>'
  if (/<\/head>/i.test(html)) html = html.replace(/<\/head>/i, `${watermark}</head>`)
  else html = `${watermark}${html}`
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${layer}</body>`)
  return `${html}${layer}`
}

const sanitizeToken = (value) => String(value || '').match(/^[a-f0-9]{36}$/i)?.[0] || null

const handlePublish = async (request, env) => {
  const origin = getAllowedOrigin(request, env)
  if (env.ALLOWED_ORIGINS && !origin) return json(request, env, { error: 'Origen no autorizado.' }, 403)

  let payload
  try {
    payload = await request.json()
  } catch {
    return json(request, env, { error: 'Solicitud inválida.' }, 400)
  }

  const mode = payload?.mode
  if (mode !== 'free' && mode !== 'limited') {
    return json(request, env, { error: 'Tipo de publicación no válido.' }, 400)
  }

  const html = String(payload?.html || '')
  if (!html || html.length > MAX_HTML_BYTES) {
    return json(request, env, { error: `El HTML debe tener entre 1 y ${MAX_HTML_BYTES} bytes.` }, 413)
  }

  const token = createToken()
  const publishedHtml = mode === 'limited' ? addLimitedWatermark(html) : html
  const key = `publications/${token}.html`

  await env.PUBLICATIONS.put(key, publishedHtml, {
    httpMetadata: {
      contentType: 'text/html; charset=utf-8',
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: {
      mode,
      projectId: String(payload?.projectId || ''),
      title: String(payload?.title || 'Invitación de boda').slice(0, 200),
      createdAt: new Date().toISOString(),
    },
  })

  return json(request, env, {
    ok: true,
    mode,
    token,
    url: getPublicUrl(request, env, token),
  }, 201)
}

const handlePublication = async (request, env, token) => {
  const safeToken = sanitizeToken(token)
  if (!safeToken) return new Response('No encontrado', { status: 404 })

  const object = await env.PUBLICATIONS.get(`publications/${safeToken}.html`)
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

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) })
    }

    if (request.method === 'POST' && url.pathname === '/api/publish') {
      try {
        return await handlePublish(request, env)
      } catch (error) {
        console.error('Publication error', error)
        return json(request, env, { error: 'No se pudo guardar la publicación en R2.' }, 500)
      }
    }

    if (request.method === 'GET' && url.pathname.startsWith('/i/')) {
      return handlePublication(request, env, url.pathname.slice(3))
    }

    return new Response('Invitaciones Digitales · Worker activo', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  },
}
