import { useState } from 'react'
import { createDefaultWeddingProject } from './data/weddingSchema.js'
import './styles/app.css'

function App() {
  const [project, setProject] = useState(createDefaultWeddingProject)
  const [mode, setMode] = useState('editor')

  const updateProject = (patch) => {
    setProject((current) => ({
      ...current,
      ...patch,
      updated: new Date().toISOString(),
    }))
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-kicker">Invitaciones Digitales</p>
          <h1>Editor de invitación</h1>
        </div>
        <div className="mode-switch" role="tablist" aria-label="Modo de trabajo">
          <button
            className={mode === 'editor' ? 'active' : ''}
            onClick={() => setMode('editor')}
          >
            Editar
          </button>
          <button
            className={mode === 'preview' ? 'active' : ''}
            onClick={() => setMode('preview')}
          >
            Vista previa
          </button>
        </div>
      </header>

      <section className="workspace">
        <div className="workspace-panel">
          {mode === 'editor' ? (
            <>
              <h2>Proyecto nuevo</h2>
              <p className="muted">
                La base del editor está preparada. Aquí construiremos cada sección de la
                invitación sin alterar el template ya definido.
              </p>

              <label className="field">
                <span>Nombre de la novia</span>
                <input
                  value={project.couple.name1}
                  onChange={(event) =>
                    setProject((current) => ({
                      ...current,
                      couple: { ...current.couple, name1: event.target.value },
                      updated: new Date().toISOString(),
                    }))
                  }
                  placeholder="Nombre"
                />
              </label>

              <label className="field">
                <span>Nombre del novio</span>
                <input
                  value={project.couple.name2}
                  onChange={(event) =>
                    setProject((current) => ({
                      ...current,
                      couple: { ...current.couple, name2: event.target.value },
                      updated: new Date().toISOString(),
                    }))
                  }
                  placeholder="Nombre"
                />
              </label>

              <button
                className="secondary-button"
                onClick={() => updateProject({ published: false })}
              >
                Guardar cambios locales
              </button>
            </>
          ) : (
            <div className="preview-info">
              <p className="app-kicker">Vista previa</p>
              <h2>{project.couple.name1 || 'Nombre'} &amp; {project.couple.name2 || 'Nombre'}</h2>
              <p className="muted">El template visual completo se construirá a partir de este schema.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
