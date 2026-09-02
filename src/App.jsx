import { useMemo, useState } from 'react'
import { createDefaultWeddingProject } from './data/weddingSchema.js'
import { createProjectRecord, deleteProject, getProjects, saveProject } from './data/projectManager.js'
import DashboardWedding from './creator/DashboardWedding.jsx'
import EditorWedding from './creator/EditorWedding.jsx'
import PreviewWedding from './creator/PreviewWedding.jsx'
import { renderWeddingHTML } from './export/weddingOutput.js'
import { applyCoverPositionsToExport } from './export/applyCoverPositions.js'
import './styles/app.css'
import './styles/wedding.css'
import './styles/dashboard.css'
import './styles/previewZoom.css'
import './styles/previewClean.css'

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

function downloadWeddingHTML(project) {
  const html = applyCoverPositionsToExport(renderWeddingHTML(project), project)
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
  const [zoomedDevice, setZoomedDevice] = useState(false)

  const activeProject = useMemo(() => projects.find((project) => project.id === activeProjectId) || null, [projects, activeProjectId])

  const openEditor = (id) => {
    setActiveProjectId(id)
    setActiveSection('appearance')
    setPreviewRefreshKey((current) => current + 1)
    setZoomedDevice(false)
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
  const openPreviewZoom = () => setZoomedDevice(true)
  const closePreviewZoom = () => setZoomedDevice(false)

  if (view === 'dashboard') {
    return <DashboardWedding projects={projects} onNew={createNewProject} onEdit={openEditor} onDelete={handleDelete} onExport={handleExport} />
  }

  if (!activeProject) return null

  return (
    <main className="app-shell">
      <header className="app-header editor-page-header">
        <div className="editor-header-main">
          <div className="editor-header-title">
            <button className="back-to-projects" type="button" onClick={() => setView('dashboard')}>← Mis proyectos</button>
            <p className="app-kicker">Editor de invitación</p>
            <h1>{activeProject.name || activeProject.coverSection.title}</h1>
          </div>
          <div className="header-actions">
            <div className="header-badge"><span className="status-dot" /> Guardado automático</div>
            <button className="preview-refresh-button" type="button" onClick={() => setPreviewRefreshKey((current) => current + 1)} title="Recargar únicamente la vista previa">↻ Recargar VP</button>
            <button className="export-header-button" type="button" onClick={() => handleExport(activeProject)}>Exportar HTML</button>
          </div>
        </div>
      </header>
      <section className="workspace">
        <main className="creator-editor">
          <section className="creator-panel"><EditorWedding project={activeProject} setProject={updateProject} activeSection={activeSection} setActiveSection={setActiveSection} /></section>
          <section className="creator-preview">
            <div className="preview-toolbar">
              <div><p className="app-kicker">Vista previa</p><strong>POCO X8 Pro</strong></div>
              <span className="preview-device-label">Simulador</span>
            </div>
            <div className="preview-stage">
              <div className="preview-device-shell preview-device-shell-pro" aria-label="Simulación del POCO X8 Pro">
                <button className="preview-zoom-button" type="button" onClick={openPreviewZoom} title="Ampliar VP del POCO X8 Pro" aria-label="Ampliar VP del POCO X8 Pro">⌕</button>
                <div className="preview-device-camera" aria-hidden="true" />
                <div className="preview-device-buttons" aria-hidden="true" />
                <div className="preview-device-screen"><PreviewWedding project={activeProject} refreshKey={previewRefreshKey} /></div>
              </div>
            </div>
          </section>
        </main>
      </section>

      {zoomedDevice && (
        <div className="preview-zoom-overlay" role="dialog" aria-modal="true" aria-label="Vista previa ampliada" onMouseDown={(event) => { if (event.target === event.currentTarget) closePreviewZoom() }}>
          <div className="preview-zoom-toolbar">
            <strong>POCO X8 Pro</strong>
            <button type="button" onClick={closePreviewZoom} title="Cerrar vista ampliada" aria-label="Cerrar vista ampliada">×</button>
          </div>
          <div className="preview-zoom-device-shell">
            <div className="preview-device-camera" aria-hidden="true" />
            <div className="preview-device-buttons" aria-hidden="true" />
            <div className="preview-device-screen"><PreviewWedding project={activeProject} refreshKey={previewRefreshKey} /></div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
