import { renderWeddingHTML } from './weddingOutput.js'
import { applyCoverPositionsToExport } from './applyCoverPositions.js'
import { applyWeddingEditorParity } from './applyWeddingEditorParity.js'
import { embedWeddingFonts } from './embedWeddingFonts.js'

const addClosingScrollSpace = (html) => {
  const closingSpaceCss = '<style id="wedding-closing-scroll-space">.phone>.closing{min-height:700px!important;padding-bottom:300px!important;overflow:visible!important}</style>'
  return String(html || '').replace('</head>', `${closingSpaceCss}</head>`)
}

export async function getWeddingExportHTML(project) {
  const rendered = renderWeddingHTML(project)
  const withCoverSync = applyCoverPositionsToExport(rendered, project)
  const withEditorParity = applyWeddingEditorParity(withCoverSync, project)
  const withClosingScrollSpace = addClosingScrollSpace(withEditorParity)
  return embedWeddingFonts(withClosingScrollSpace)
}

export default getWeddingExportHTML
