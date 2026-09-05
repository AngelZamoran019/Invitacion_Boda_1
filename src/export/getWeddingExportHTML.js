import { renderWeddingHTML } from './weddingOutput.js'
import { applyCoverPositionsToExport } from './applyCoverPositions.js'
import { applyWeddingEditorParity } from './applyWeddingEditorParity.js'

export function getWeddingExportHTML(project) {
  const rendered = renderWeddingHTML(project)
  const withCoverSync = applyCoverPositionsToExport(rendered, project)
  return applyWeddingEditorParity(withCoverSync, project)
}

export default getWeddingExportHTML
