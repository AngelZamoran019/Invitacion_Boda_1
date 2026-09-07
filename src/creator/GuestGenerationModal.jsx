import { useEffect, useState } from 'react'
import { createGuestBase, createGuestPanel, getGuestBaseUrl, getGuestPanelUrl } from '../data/guestControlClient.js'
import '../styles/guestControl.css'

export default function GuestGenerationModal({ mode, project, onClose, onSaved }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isPanel = mode === 'panel'

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
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
        ...(isPanel ? { panelToken: token } : { baseToken: token }),
      }
      onSaved(guestControl)
      try { await navigator.clipboard?.writeText(url) } catch { /* clipboard optional */ }
      window.prompt(`${isPanel ? 'Panel generado' : 'Base generada'}\n\nEl enlace se copió al portapapeles cuando el navegador lo permitió. También puedes copiarlo aquí:`, url)
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
        <p>{isPanel ? 'Crea el acceso privado desde donde el cliente configurará los nombres de familia o invitados y el número de invitados.' : 'Crea el acceso privado donde se verá el estado de las confirmaciones de esta invitación.'}</p>
        <form onSubmit={submit}>
          <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus autoComplete="new-password" placeholder="Mínimo 4 caracteres" /></label>
          <label>Confirmar contraseña<input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" placeholder="Repite la contraseña" /></label>
          {error && <div className="guest-error">{error}</div>}
          <button type="submit" disabled={busy}>{busy ? 'Generando…' : isPanel ? 'Generar Panel' : 'Generar Base'}</button>
        </form>
      </section>
    </div>
  )
}
