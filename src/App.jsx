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
    // Fall back to a clean project when local storage is unavailable/corrupt.
  }
  return createDefaultWeddingProject()
}

function App() {
  const [project, setProject] = useState(loadProject)
  const [mode, setMode] = useState('editor')
  const [activeSection, setActiveSection] = useState('appearance')

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
  }, [project])

  const resetProject = () => {
    if (!window.confirm('¿Quieres crear una invitación nueva? Se perderán los cambios locales actuales.')) return
    setProject(createDefaultWeddingProject())
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
          <div className="mode-switch" role="tablist" aria-label="Modo de trabajo">
            <button className={mode === 'editor' ? 'active' : ''} onClick={() => setMode('editor')}>Editar</button>
            <button className={mode === 'preview' ? 'active' : ''} onClick={() => setMode('preview')}>Vista previa</button>
          </div>
          <button className="reset-button" type="button" onClick={resetProject}>Nuevo</button>
        </div>
      </header>

      <section className="workspace">
        {mode === 'editor' ? (
          <EditorWedding
            project={project}
            setProject={setProject}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        ) : (
          <PreviewWedding project={project} />
        )}
      </section>
    </main>
  )
}

export default App
