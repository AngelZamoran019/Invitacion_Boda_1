import { createDefaultWeddingProject } from './weddingSchema'

const PROJECTS_KEY = 'invitacion-boda-1-projects'
const ACTIVE_PROJECT_KEY = 'invitacion-boda-1-active-project'

const isPlainObject = (value) => (
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value)
)

const mergeProjectDefaults = (project) => {
  const defaults = createDefaultWeddingProject()

  const merge = (base, value) => {
    if (!isPlainObject(base)) {
      return value === undefined ? base : value
    }

    const source = isPlainObject(value) ? value : {}
    const result = { ...base }

    Object.keys(base).forEach((key) => {
      if (source[key] === undefined || source[key] === null) return

      if (isPlainObject(base[key])) {
        result[key] = merge(base[key], source[key])
      } else {
        result[key] = source[key]
      }
    })

    Object.keys(source).forEach((key) => {
      if (!(key in result)) result[key] = source[key]
    })

    return result
  }

  return merge(defaults, project)
}

const readProjects = () => {
  try {
    const saved = window.localStorage.getItem(PROJECTS_KEY)
    const projects = saved ? JSON.parse(saved) : []
    if (!Array.isArray(projects)) return []

    return projects
      .filter(Boolean)
      .map((project) => mergeProjectDefaults(project))
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
  const normalized = mergeProjectDefaults(project)
  const next = {
    ...normalized,
    updated: new Date().toISOString()
  }

  const index = projects.findIndex((item) => item.id === next.id)

  if (index >= 0) {
    projects[index] = next
  } else {
    projects.unshift(next)
  }

  writeProjects(projects)
  window.localStorage.setItem(ACTIVE_PROJECT_KEY, next.id)
  return next
}

export const createProjectRecord = (project) => {
  const id = globalThis.crypto?.randomUUID?.() || `wedding-${Date.now()}`
  return saveProject({ ...mergeProjectDefaults(project), id })
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
