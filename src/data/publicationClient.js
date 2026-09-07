import { getWeddingExportHTML } from '../export/getWeddingExportHTML.js'

const configuredApiUrl = String(import.meta.env.VITE_PUBLICATION_API_URL || '').trim()

const getApiUrl = () => {
  if (configuredApiUrl) return configuredApiUrl.replace(/\/$/, '')
  return `${window.location.origin}/api/publish`
}

export const openWeddingPreview = async (project) => {
  const previewWindow = window.open('', '_blank')
  if (!previewWindow) {
    throw new Error('El navegador bloqueó la nueva pestaña de Vista previa.')
  }

  previewWindow.document.write('<!doctype html><title>Generando vista previa…</title><body style="margin:0;background:#0b1020;color:#fff;font-family:system-ui,sans-serif;display:grid;place-items:center;height:100vh">Generando vista previa…</body>')
  previewWindow.document.close()

  try {
    const html = await getWeddingExportHTML(project)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    previewWindow.location.href = url
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (error) {
    previewWindow.close()
    throw error
  }
}

export const publishWeddingProject = async (project, mode) => {
  if (mode !== 'free' && mode !== 'limited') {
    throw new Error('Tipo de publicación no válido.')
  }

  const html = await getWeddingExportHTML(project)
  const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode,
      html,
      projectId: project.id,
      title: project.name || project.coverSection?.title || 'Invitación de boda',
    }),
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    // Keep the generic error below when the Worker did not return JSON.
  }

  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error || 'No se pudo publicar la invitación.')
  }

  return payload.url
}
