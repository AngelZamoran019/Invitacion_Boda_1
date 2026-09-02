import { useMemo, useState } from 'react'
import { createDefaultWeddingProject } from './data/weddingSchema.js'
import { createProjectRecord, deleteProject, getProjects, saveProject } from './data/projectManager.js'
import DashboardWedding from './creator/DashboardWedding.jsx'
import EditorWedding from './creator/EditorWedding.jsx'
import PreviewWedding from './creator/PreviewWedding.jsx'
import { renderWeddingHTML } from './export/weddingOutput.js'
import './styles/app.css'
import './styles/wedding.css'
import './styles/dashboard.css'

const LEGACY_KEY = 'invitacion-boda-1-project'

function readInitialProjects() {
  const existing = getProjects()
  if (existing.length) return existing
  try {
    const legacy = window.localStorage.getItem(LEGACY_KEY)
    if (legacy) return [createProjectRecord(JSON.parse(legacy))]
  } catch {
    // Fall through to a fresh project.
  }
  return [createProjectRecord(createDefaultWeddingProject())]
}

function applyCoverPositionStyles(html, project) {
  const cover = project?.coverSection || {}
  const safe = (value) => {
    const number = Number(value)
    if (!Number.isFinite(number)) return 0
    return Math.max(-300, Math.min(300, number))
  }
  const eyebrowY = safe(cover.eyebrowPositionY)
  const titleY = safe(cover.titlePositionY)
  const dateY = safe(cover.datePositionY)
  const buttonY = safe(cover.buttonPositionY)
  const ornamentY = safe(cover.ornamentPositionY)
  const lineY = safe(cover.linePositionY)

  const positionCss = `<style id="wedding-cover-position-export">
    .phone>.cover>.ornament{position:relative!important;top:${ornamentY}px!important}
    .phone>.cover>.eyebrow{position:relative!important;top:${eyebrowY}px!important}
    .phone>.cover>h1{position:relative!important;top:${titleY}px!important}
    .phone>.cover>.date{position:relative!important;top:${dateY}px!important}
    .phone>.cover>.button{position:relative!important;top:${buttonY}px!important}
    .phone>.cover>.line{position:relative!important;top:${lineY}px!important}
  </style>`

  return String(html || '').replace('</head>', `${positionCss}</head>`)
}

function downloadWeddingHTML(project) {
  let html = renderWeddingHTML(project)
  html = applyCoverPositionStyles(html, project)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${(project.name || project.coverSection?.title || 'invitacion').replace(/[^a-z0-9áéíóúüñ _-]/gi, '').trim() || 'invitacion'}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function App() {
  const [projects, setProjects] = useState(readInitialProjects)
  const [view, setView] = useState('dashboard')
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [activeSection, setActiveSection] = useState('appearance')
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0)

  const activeProject = useMemo(() => projects.find((project) => project.id === activeProjectId) || null, [projects, activeProjectId])

  const openEditor = (id) => {
    setActiveProjectId(id)
    setActiveSection('appearance')
    setPreviewRefreshKey((current) => current + 1)
    setView('editor')
  }

  const updateProject = (updater) => {
    setProjects((currentProjects) => {
      const current = currentProjects.find((project) => project.id === activeProjectId)
      if (!current) return currentProjects
      const next = typeof updater === 'function' ? updater(current) : updater
      const saved = saveProject(next)
      return currentProjects.map((project) => project.id === saved.id ? saved : project)
    })
  }

  const createNewProject = () => {
    const project = createProjectRecord(createDefaultWeddingProject())
    setProjects((current) => [project, ...current])
    openEditor(project.id)
  }

  const handleDelete = (id) => {
    const project = projects.find((item) => item.id === id)
    const label = project?.name || project?.coverSection?.title || 'este proyecto'
    if (!window.confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) return
    setProjects(deleteProject(id))
    if (activeProjectId === id) {
      setActiveProjectId(null)
      setView('dashboard')
    }
  }

  const handleExport = (project) => downloadWeddingHTML(project)

  if (view === 'dashboard') {
    return <DashboardWedding projects={projects} onNew={createNewProject} onEdit={openEditor} onDelete={handleDelete} onExport={handleExport} />
  }

  if (!activeProject) return null

  const previewMaxStyle = {
    width: '42%',
    maxWidth: '180px',
    flex: '0 1 42%',
  }

  const previewProStyle = {
    width: '36%',
    maxWidth: '155px',
    flex: '0 1 36%',
  }

  const previewPairStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '18px',
    boxSizing: 'border-box',
  }

  return (
    <main className="app-shell">
      <header className="app-header editor-page-header">
        <div>
          <button className="back-to-projects" type="button" onClick={() => setView('dashboard')}>← Mis proyectos</button>
          <p className="app-kicker">Editor de invitación</p>
          <h1>{activeProject.name || activeProject.coverSection.title}</h1>
        </div>
        <div className="header-actions">
          <div className="header-badge"><span className="status-dot" /> Guardado automático</div>
          <button className="preview-refresh-button" type="button" onClick={() => setPreviewRefreshKey((current) => current + 1)} title="Recargar únicamente la vista previa">↻ Recargar VP</button>
          <button className="export-header-button" type="button" onClick={() => handleExport(activeProject)}>Exportar HTML</button>
        </div>
      </header>
      <section className="workspace">
        <main className="creator-editor">
          <section className="creator-panel"><EditorWedding project={activeProject} setProject={updateProject} activeSection={activeSection} setActiveSection={setActiveSection} /></section>
          <section className="creator-preview">
            <div className="preview-toolbar">
              <div><p className="app-kicker">Vista previa</p><strong>POCO X8 Pro Max + POCO X8 Pro</strong></div>
              <span className="preview-device-label">2 dispositivos</span>
            </div>
            <div className="preview-stage">
              <div style={previewPairStyle}>
                <div className="preview-device-shell preview-device-shell-max" style={previewMaxStyle} aria-label="Simulación del POCO X8 Pro Max">
                  <div className="preview-device-camera" aria-hidden="true" />
                  <div className="preview-device-buttons" aria-hidden="true" />
                  <div className="preview-device-screen">
                    <PreviewWedding project={activeProject} refreshKey={previewRefreshKey} />
                  </div>
                </div>
                <div className="preview-device-shell preview-device-shell-pro" style={previewProStyle} aria-label="Simulación del POCO X8 Pro">
                  <div className="preview-device-camera" aria-hidden="true" />
                  <div className="preview-device-buttons" aria-hidden="true" />
                  <div className="preview-device-screen">
                    <PreviewWedding project={activeProject} refreshKey={previewRefreshKey} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </section>
    </main>
  )
}

export default App
