const configuredApiUrl = String(import.meta.env.VITE_PUBLICATION_API_URL || '').trim()

const getApiUrl = () => {
  if (configuredApiUrl) return configuredApiUrl.replace(/\/$/, '')
  return `${window.location.origin}/api`
}

const request = async (path, options = {}) => {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  let payload = null
  try { payload = await response.json() } catch { /* generic error below */ }
  if (!response.ok) throw new Error(payload?.error || 'No se pudo completar la operación.')
  return payload
}

export const createGuestPanel = (project, password) => request('/guest/panel', {
  method: 'POST',
  body: JSON.stringify({
    projectId: project.id,
    title: project.name || project.coverSection?.title || 'Invitación de boda',
    password,
  }),
})

export const createGuestBase = (project, password) => request('/guest/base', {
  method: 'POST',
  body: JSON.stringify({ projectId: project.id, panelToken: project.guestControl?.panelToken || '', password }),
})

export const loginGuestArea = (type, token, password) => request(`/guest/${type}/${encodeURIComponent(token)}/login`, {
  method: 'POST',
  body: JSON.stringify({ password }),
})

export const getGuestEntries = (type, token, session) => request(`/guest/${type}/${encodeURIComponent(token)}/entries`, {
  headers: { Authorization: `Bearer ${session}` },
})

export const createGuestEntry = (token, session, entry) => request(`/guest/panel/${encodeURIComponent(token)}/entries`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${session}` },
  body: JSON.stringify(entry),
})

export const updateGuestEntry = (token, session, id, entry) => request(`/guest/panel/${encodeURIComponent(token)}/entries/${encodeURIComponent(id)}`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${session}` },
  body: JSON.stringify(entry),
})

export const deleteGuestEntry = (token, session, id) => request(`/guest/panel/${encodeURIComponent(token)}/entries/${encodeURIComponent(id)}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${session}` },
})

export const submitGuestRsvp = (baseToken, data) => request(`/guest/rsvp/${encodeURIComponent(baseToken)}`, {
  method: 'POST',
  body: JSON.stringify(data),
})

export const getGuestPanelUrl = (token) => `${window.location.origin}/control/panel/${token}`
export const getGuestBaseUrl = (token) => `${window.location.origin}/control/base/${token}`
