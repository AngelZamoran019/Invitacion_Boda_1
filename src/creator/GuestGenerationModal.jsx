import { useEffect, useState } from 'react'
import { createGuestBase, createGuestPanel, getGuestBaseUrl, getGuestPanelUrl } from '../data/guestControlClient.js'
import '../styles/guestControl.css'

export default function GuestGenerationModal({ mode, project, onClose, onSaved }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isPanel = mode === 'panel'
  const existingToken = isPanel ? project.guestControl?.panelToken : project.guestControl?.baseToken
  const existingUrl = existingToken ? (isPanel ? getGuestPanelUrl(existingToken) : getGuestBaseUrl(existingToken)) : ''

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (existingToken) {
      try { await navigator.clipboard?.writeText(existingUrl) } catch { /* clipboard optional */ }
      window.prompt(`${isPanel ? 'Panel ya generado' : 'Base ya generada'}\n\nEste proyecto conserva siempre el mismo enlace.\n\nEl enlace se copió al portapapeles cuando el navegador lo permitió. También puedes copiarlo aquí:`, existingUrl)
      onClose()
      return
    }
    if (password.length < 4) return setError('La contraseña debe tener al menos 4 caracteres.')
    if (password !== confirm) return setError('Las contraseñas no coinciden.')
    if (!isPanel && !project.guestControl?.panelToken) return setError('Primero genera el Panel para este proyecto.')
    setBusy(true)
    try {
      const payload = isPanel ? await createGuestPanel(project, password) : await createGuestBase(project, password)
      const token = payload.token
      const url = isPanel ? getGuestPanelUrl(token) : getGuestBaseUrl(token)
      const guestControl = {
        ...(project.guestControl || {}),
        ...(isPanel ? { panelToken: token, panelUrl: url } : { baseToken: token, baseUrl: url }),
      }
      onSaved(guestControl)
      try { await navigator.clipboard?.writeText(url) } catch { /* clipboard optional */ }
      window.prompt(`${isPanel ? 'Panel generado' : 'Base generada'}\n\nEste enlace queda asociado permanentemente a este proyecto.\n\nEl enlace se copió al portapapeles cuando el navegador lo permitió. También puedes copiarlo aquí:`, url)
      onClose()
    } catch (err) {
      setError(err?.message || 'No se pudo generar el enlace.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="guest-modal-backdrop" role="dialog" aria-modal="true" aria-label={isPanel ? 'Generar Panel' : 'Generar Base'} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
      <section className="guest-generation-modal">
        <button className="guest-modal-close" type="button" onClick={onClose} disabled={busy} aria-label="Cerrar">×</button>
        <div className="guest-access-mark">✦</div>
        <p className="guest-kicker">{isPanel ? 'Administración' : 'Seguimiento'}</p>
        <h2>{isPanel ? 'Generar Panel' : 'Generar Base'}</h2>
        <p>{existingToken ? `Este proyecto ya tiene un ${isPanel ? 'Panel' : 'Base'} generado. Al volver a abrir esta opción se conservará el mismo enlace.` : isPanel ? 'Crea el acceso privado desde donde el cliente configurará los nombres de familia o invitados y el número de invitados.' : 'Crea el acceso privado donde se verá el estado de las confirmaciones de esta invitación.'}</p>
        <form onSubmit={submit}>
          {!existingToken && <>
            <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus autoComplete="new-password" placeholder="Mínimo 4 caracteres" /></label>
            <label>Confirmar contraseña<input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" placeholder="Repite la contraseña" /></label>
          </>}
          {existingToken && <div className="guest-existing-link"><strong>Enlace permanente</strong><span>{existingUrl}</span></div>}
          {error && <div className="guest-error">{error}</div>}
          <button type="submit" disabled={busy}>{busy ? 'Generando…' : existingToken ? 'Ver enlace existente' : isPanel ? 'Generar Panel' : 'Generar Base'}</button>
        </form>
      </section>
    </div>
  )
}
