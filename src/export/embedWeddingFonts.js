const fontDataCache = new Map()

const toBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + chunkSize, bytes.length)))
  }
  return btoa(binary)
}

const getFontMimeType = (file) => {
  const lower = String(file || '').toLowerCase()
  if (lower.endsWith('.otf')) return 'font/otf'
  if (lower.endsWith('.woff2')) return 'font/woff2'
  if (lower.endsWith('.woff')) return 'font/woff'
  if (lower.endsWith('.ttf')) return 'font/ttf'
  return 'application/octet-stream'
}

const loadFontDataUrl = async (file) => {
  if (fontDataCache.has(file)) return fontDataCache.get(file)

  const promise = fetch(`/fonts/${encodeURIComponent(file)}`)
    .then((response) => {
      if (!response.ok) throw new Error(`No se pudo cargar la fuente ${file}`)
      return response.arrayBuffer()
    })
    .then((buffer) => `data:${getFontMimeType(file)};base64,${toBase64(buffer)}`)

  fontDataCache.set(file, promise)
  try {
    return await promise
  } catch (error) {
    fontDataCache.delete(file)
    throw error
  }
}

export async function embedWeddingFonts(html) {
  const source = String(html || '')
  const files = [...new Set([...source.matchAll(/url\(['"]?\/fonts\/([^)'"?#]+)[^)]*\)/gi)].map((match) => decodeURIComponent(match[1])))]
  if (!files.length) return source

  const replacements = await Promise.all(files.map(async (file) => [file, await loadFontDataUrl(file)]))
  let embedded = source
  replacements.forEach(([file, dataUrl]) => {
    const escapedFile = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    embedded = embedded.replace(new RegExp(`url\\((['"]?)\\/fonts\\/${escapedFile}[^)]*\\)`, 'gi'), `url("${dataUrl}")`)
  })
  return embedded
}

export default embedWeddingFonts
