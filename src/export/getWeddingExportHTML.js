import { renderWeddingHTML } from './weddingOutput.js'
import { applyCoverPositionsToExport } from './applyCoverPositions.js'

export function getWeddingExportHTML(project) {
  return applyCoverPositionsToExport(renderWeddingHTML(project), project)
}

export default getWeddingExportHTML
