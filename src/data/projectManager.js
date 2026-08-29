const PROJECTS_KEY = 'invitacion-boda-1-projects'
const ACTIVE_PROJECT_KEY = 'invitacion-boda-1-active-project'

const readProjects = () => {
  try {
    const saved = window.localStorage.getItem(PROJECTS_KEY)
    const projects = saved ? JSON.parse(saved) : []
    return Array.isArray(projects) ? projects : []
  } catch {
    return []
  }
}

const writeProjects = (projects) => {
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export const getProjects = () => readProjects()

export const saveProject = (project) => {
  const projects = readProjects()
  const next = { ...project, updated: new Date().toISOString() }
  const index = projects.findIndex((item) => item.id === next.id)
  if (index >= 0) projects[index] = next
  else projects.unshift(next)
  writeProjects(projects)
  window.localStorage.setItem(ACTIVE_PROJECT_KEY, next.id)
  return next
}

export const createProjectRecord = (project) => {
  const id = globalThis.crypto?.randomUUID?.() || `wedding-${Date.now()}`
  return saveProject({ ...project, id })
}

export const deleteProject = (id) => {
  const projects = readProjects().filter((project) => project.id !== id)
  writeProjects(projects)
  if (window.localStorage.getItem(ACTIVE_PROJECT_KEY) === id) {
    window.localStorage.removeItem(ACTIVE_PROJECT_KEY)
  }
  return projects
}

export const getActiveProjectId = () => window.localStorage.getItem(ACTIVE_PROJECT_KEY)

export const setActiveProjectId = (id) => {
  window.localStorage.setItem(ACTIVE_PROJECT_KEY, id)
}

export const migrateLegacyProject = (project) => {
  const projects = readProjects()
  if (projects.length) return projects
  if (!project) return []
  return [createProjectRecord(project)]
}
