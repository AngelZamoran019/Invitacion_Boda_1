import { renderWeddingHTML } from './weddingOutput.js'
import { applyCoverPositionsToExport } from './applyCoverPositions.js'
import { applyWeddingEditorParity } from './applyWeddingEditorParity.js'
import { applyWeddingScrollAnimations } from './applyWeddingScrollAnimations.js'
import { embedWeddingFonts } from './embedWeddingFonts.js'

const addClosingScrollSpace = (html) => {
  const closingSpaceCss = '<style id="wedding-closing-scroll-space">.phone>.closing{min-height:55dvh!important;padding-bottom:20dvh!important;overflow:visible!important}.phone>.closing .text{margin-bottom:0!important}</style>'
  return String(html || '').replace('</head>', `${closingSpaceCss}</head>`)
}

export async function getWeddingExportHTML(project) {
  const rendered = renderWeddingHTML(project)
  const withCoverSync = applyCoverPositionsToExport(rendered, project)
  const withEditorParity = applyWeddingEditorParity(withCoverSync, project)
  const withScrollAnimations = applyWeddingScrollAnimations(withEditorParity)
  const withClosingScrollSpace = addClosingScrollSpace(withScrollAnimations)
  return embedWeddingFonts(withClosingScrollSpace)
}

export default getWeddingExportHTML
