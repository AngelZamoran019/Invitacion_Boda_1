import { renderWeddingHTML } from './weddingOutput.js'
import { applyCoverPositionsToExport } from './applyCoverPositions.js'
import { applyWeddingEditorParity } from './applyWeddingEditorParity.js'
import { embedWeddingFonts } from './embedWeddingFonts.js'
import { applyWeddingScrollAnimations } from './applyWeddingScrollAnimations.js'

export async function getWeddingExportHTML(project) {
  const rendered = renderWeddingHTML(project)
  const withCoverSync = applyCoverPositionsToExport(rendered, project)
  const withEditorParity = applyWeddingEditorParity(withCoverSync, project)
  const withFonts = embedWeddingFonts(withEditorParity)
  return applyWeddingScrollAnimations(withFonts)
}

export default getWeddingExportHTML
