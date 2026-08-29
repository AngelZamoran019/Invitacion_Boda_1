import { useEffect, useState } from 'react'
import { createDefaultWeddingProject } from './data/weddingSchema.js'
import EditorWedding from './creator/EditorWedding.jsx'
import PreviewWedding from './creator/PreviewWedding.jsx'
import './styles/app.css'
import './styles/wedding.css'

const STORAGE_KEY = 'invitacion-boda-1-project'

function loadProject() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // Use a fresh project when local storage is unavailable or invalid.
  }
  return createDefaultWeddingProject()
}

function App() {
  const [project, setProject] = useState(loadProject)
  const [activeSection, setActiveSection] = useState('appearance')

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
  }, [project])

  const resetProject = () => {
    if (!window.confirm('¿Quieres crear una invitación nueva? Se perderán los cambios locales actuales.')) return
    setProject(createDefaultWeddingProject())
    setActiveSection('appearance')
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-kicker">Invitaciones Digitales</p>
          <h1>Editor de invitación</h1>
          <p className="app-description">Crea una invitación de boda elegante, móvil y completamente personalizable.</p>
        </div>
        <div className="header-actions">
          <div className="header-badge">
            <span className="status-dot" />
            Guardado local
          </div>
          <button className="reset-button" type="button" onClick={resetProject}>Nuevo</button>
        </div>
      </header>

      <section className="workspace">
        <main className="creator-editor">
          <section className="creator-panel">
            <EditorWedding
              project={project}
              setProject={setProject}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </section>

          <section className="creator-preview">
            <div className="preview-toolbar">
              <div>
                <p className="app-kicker">Vista previa</p>
                <strong>Invitación móvil</strong>
              </div>
              <span className="preview-device-label">9:16</span>
            </div>
            <div className="preview-stage">
              <PreviewWedding project={project} embedded />
            </div>
          </section>
        </main>
      </section>
    </main>
  )
}

export default App
