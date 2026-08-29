function formatDate(value) {
  if (!value) return 'Sin cambios registrados'
  try {
    return new Date(value).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return 'Sin cambios registrados'
  }
}

function getProjectTitle(project) {
  if (project.name?.trim()) return project.name
  if (project.coverSection?.title?.trim()) return project.coverSection.title
  return 'Proyecto de boda'
}

function DashboardWedding({ projects, onNew, onEdit, onDelete, onExport }) {
  return (
    <main className="projects-page">
      <header className="projects-header">
        <div>
          <p className="app-kicker">Invitaciones Digitales</p>
          <h1>Mis proyectos</h1>
          <p className="app-description">Crea, edita, exporta y administra tus invitaciones desde un solo lugar.</p>
        </div>
        <button className="primary-action" type="button" onClick={onNew}>+ Nuevo proyecto</button>
      </header>

      <section className="projects-toolbar">
        <div><strong>{projects.length}</strong> {projects.length === 1 ? 'proyecto' : 'proyectos'}</div>
        <span>Guardados en este dispositivo</span>
      </section>

      {projects.length === 0 ? (
        <section className="projects-empty">
          <div className="projects-empty-icon">✦</div>
          <h2>Aún no tienes proyectos</h2>
          <p>Comienza una nueva invitación y aparecerá aquí automáticamente.</p>
          <button className="primary-action" type="button" onClick={onNew}>Crear mi primera invitación</button>
        </section>
      ) : (
        <section className="projects-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-cover" style={project.coverSection?.backgroundImage ? { backgroundImage: `linear-gradient(rgb(5 12 28 / 48%), rgb(5 12 28 / 84%)), url(${project.coverSection.backgroundImage})` } : undefined}>
                <span className="project-template">Wedding v1</span>
                <div>
                  <p>{project.coverSection?.date || 'Fecha por definir'}</p>
                  <h2>{getProjectTitle(project)}</h2>
                </div>
              </div>
              <div className="project-card-body">
                <div className="project-card-meta">
                  <strong>{getProjectTitle(project)}</strong>
                  <span>Actualizado {formatDate(project.updated)}</span>
                </div>
                <div className="project-actions">
                  <button type="button" className="project-action primary" onClick={() => onEdit(project.id)}>Editar</button>
                  <button type="button" className="project-action" onClick={() => onExport(project)}>Exportar</button>
                  <button type="button" className="project-action" disabled title="Disponible próximamente">Vista previa</button>
                  <button type="button" className="project-action" disabled title="Disponible próximamente">Duplicar</button>
                  <button type="button" className="project-action" disabled title="Disponible próximamente">Publicar</button>
                  <button type="button" className="project-action danger" onClick={() => onDelete(project.id)}>Eliminar</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default DashboardWedding
