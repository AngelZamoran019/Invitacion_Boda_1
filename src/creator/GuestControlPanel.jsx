import { useEffect, useMemo, useState } from 'react'
import { createGuestEntry, deleteGuestEntry, getGuestEntries, loginGuestArea, updateGuestEntry } from '../data/guestControlClient.js'
import '../styles/guestControl.css'

const formatNumber = (value) => new Intl.NumberFormat('es-MX').format(Number(value) || 0)

function PasswordGate({ type, token, onLogin }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    if (!password.trim()) return
    setBusy(true); setError('')
    try { onLogin(await loginGuestArea(type, token, password)) } catch (err) { setError(err?.message || 'Contraseña incorrecta.') } finally { setBusy(false) }
  }
  return <main className="guest-access-page"><section className="guest-access-card"><div className="guest-access-mark">✦</div><p className="guest-kicker">Invitaciones Digitales</p><h1>{type === 'panel' ? 'Panel de invitados' : 'Base de invitados'}</h1><p>Ingresa la contraseña configurada para acceder a esta área privada.</p><form onSubmit={submit}><label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus autoComplete="current-password" /></label>{error && <div className="guest-error">{error}</div>}<button type="submit" disabled={busy}>{busy ? 'Verificando…' : 'Ingresar'}</button></form></section></main>
}

function GuestPanel({ token, initial, onLogout }) {
  const [data, setData] = useState(initial)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState({ name: '', guests: 1 })
  const [editingId, setEditingId] = useState(null)
  const [editing, setEditing] = useState({ name: '', guests: 1 })
  const [busy, setBusy] = useState(false)
  const session = initial.session
  const refresh = async () => { try { setData((current) => ({ ...current, ...(await getGuestEntries('panel', token, session)) })) } catch { /* keep current data */ } }
  useEffect(() => { const timer = window.setInterval(refresh, 5000); return () => window.clearInterval(timer) }, [token, session])
  const filtered = useMemo(() => { const query = search.trim().toLocaleLowerCase('es-MX'); if (!query) return data.entries || []; return (data.entries || []).filter((entry) => entry.name.toLocaleLowerCase('es-MX').includes(query)) }, [data.entries, search])
  const add = async (event) => { event.preventDefault(); if (!draft.name.trim()) return; setBusy(true); try { setData(await createGuestEntry(token, session, { name: draft.name, guests: Number(draft.guests) || 1 })); setDraft({ name: '', guests: 1 }) } catch (err) { window.alert(err?.message || 'No se pudo agregar el invitado.') } finally { setBusy(false) } }
  const saveEdit = async (id) => { if (!editing.name.trim()) return; setBusy(true); try { setData(await updateGuestEntry(token, session, id, { name: editing.name, guests: Number(editing.guests) || 1 })); setEditingId(null) } catch (err) { window.alert(err?.message || 'No se pudo actualizar el invitado.') } finally { setBusy(false) } }
  const remove = async (id) => { if (!window.confirm('¿Eliminar este invitado de la lista?')) return; try { setData(await deleteGuestEntry(token, session, id)) } catch (err) { window.alert(err?.message || 'No se pudo eliminar el invitado.') } }
  return <main className="guest-dashboard"><header className="guest-dashboard-header"><div><p className="guest-kicker">Panel de administración</p><h1>{data.title}</h1><p>Control de invitados</p></div><button className="guest-logout" type="button" onClick={onLogout}>Cerrar sesión</button></header><section className="guest-stats"><article><span>Familias / invitados</span><strong>{formatNumber(data.entries?.length)}</strong></article><article><span>Invitados totales</span><strong>{formatNumber((data.entries || []).reduce((sum, entry) => sum + Number(entry.guests || 0), 0))}</strong></article><article><span>Confirmados</span><strong>{formatNumber(data.confirmedGuests || 0)}</strong></article></section><section className="guest-workspace"><div className="guest-toolbar"><div><strong>Lista inicial</strong><span>Configura aquí los nombres y cantidades.</span></div><input aria-label="Buscar invitado" placeholder="Buscar…" value={search} onChange={(event) => setSearch(event.target.value)} /></div><form className="guest-add-form" onSubmit={add}><label>Nombre de familia o invitado<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Ej. Familia Pérez" /></label><label>Número de invitados<input type="number" min="1" max="99" value={draft.guests} onChange={(event) => setDraft({ ...draft, guests: event.target.value })} /></label><button type="submit" disabled={busy}>+ Agregar</button></form><div className="guest-table-wrap"><div className="guest-table-head"><span>Nombre de familia o invitado</span><span>Número de invitados</span><span>Acciones</span></div>{filtered.length ? filtered.map((entry) => <div className="guest-table-row" key={entry.id}>{editingId === entry.id ? <><input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /><input type="number" min="1" max="99" value={editing.guests} onChange={(event) => setEditing({ ...editing, guests: event.target.value })} /><div><button type="button" onClick={() => saveEdit(entry.id)} disabled={busy}>Guardar</button><button type="button" onClick={() => setEditingId(null)}>Cancelar</button></div></> : <><strong>{entry.name}</strong><span>{entry.guests}</span><div><button type="button" onClick={() => { setEditingId(entry.id); setEditing({ name: entry.name, guests: entry.guests }) }}>Editar</button><button type="button" className="danger" onClick={() => remove(entry.id)}>Eliminar</button></div></>}</div>) : <div className="guest-empty">Aún no hay invitados configurados.</div>}</div></section></main>
}

function GuestBase({ token, initial, onLogout }) {
  const [data, setData] = useState(initial)
  const session = initial.session
  const refresh = async () => { try { setData((current) => ({ ...current, ...(await getGuestEntries('base', token, session)) })) } catch { /* keep current data */ } }
  useEffect(() => { const timer = window.setInterval(refresh, 5000); return () => window.clearInterval(timer) }, [token, session])
  const confirmed = Number(data.confirmedGuests || 0)
  const pending = Number(data.pendingGuests || 0)
  return <main className="guest-dashboard guest-base-page"><header className="guest-dashboard-header"><div><p className="guest-kicker">Base de invitados</p><h1>{data.title}</h1><p>Control de invitados</p></div><button className="guest-logout" type="button" onClick={onLogout}>Cerrar sesión</button></header><section className="guest-base-summary"><article><span>Confirmados</span><strong>{formatNumber(confirmed)}</strong><small>invitados</small></article><article><span>Pendientes</span><strong>{formatNumber(pending)}</strong><small>invitados</small></article></section><section className="guest-workspace guest-base-workspace"><div className="guest-toolbar"><div><strong>Lista de invitados</strong><span>Las respuestas se actualizan automáticamente.</span></div></div><div className="guest-table-wrap guest-response-table"><div className="guest-table-head"><span>Nombre</span><span>Asistirá</span><span>Número de invitados</span><span>Mensaje</span></div>{(data.entries || []).map((entry) => <div className="guest-table-row" key={entry.id}><strong>{entry.name}</strong><span className={`guest-status ${entry.attendance === 'yes' ? 'yes' : entry.attendance === 'no' ? 'no' : 'pending'}`}>{entry.attendance === 'yes' ? 'Sí' : entry.attendance === 'no' ? 'No' : 'Pendiente'}</span><span>{entry.guests}</span><span className="guest-message">{entry.message || '—'}</span></div>)}{!data.entries?.length && <div className="guest-empty">Aún no hay invitados configurados.</div>}</div></section></main>
}

export default function GuestControlPanel({ type, token }) {
  const [auth, setAuth] = useState(null)
  const storageKey = `guest-${type}-${token}`
  useEffect(() => { try { const saved = sessionStorage.getItem(storageKey); if (saved) setAuth(JSON.parse(saved)) } catch { /* ignore invalid session */ } }, [storageKey])
  const handleLogin = (payload) => { setAuth(payload); try { sessionStorage.setItem(storageKey, JSON.stringify(payload)) } catch { /* sessionStorage optional */ } }
  const logout = () => { setAuth(null); try { sessionStorage.removeItem(storageKey) } catch { /* ignore */ } }
  if (!auth) return <PasswordGate type={type} token={token} onLogin={handleLogin} />
  return type === 'panel' ? <GuestPanel token={token} initial={auth} onLogout={logout} /> : <GuestBase token={token} initial={auth} onLogout={logout} />
}
