import { renderWeddingHTML } from './weddingOutput.js'
import { applyCoverPositionsToExport } from './applyCoverPositions.js'
import { applyWeddingEditorParity } from './applyWeddingEditorParity.js'
import { applyWeddingScrollAnimations } from './applyWeddingScrollAnimations.js'
import { embedWeddingFonts } from './embedWeddingFonts.js'

const addClosingScrollSpace = (html) => {
  const closingSpaceCss = '<style id="wedding-closing-scroll-space">.phone>.closing{min-height:55dvh!important;padding-bottom:20dvh!important;overflow:visible!important}.phone>.closing .text{margin-bottom:0!important}</style>'
  return String(html || '').replace('</head>', `${closingSpaceCss}</head>`)
}

const disableWeddingMusicAutoplay = (html) => String(html || '')
  .replace(
    /(<audio\b[^>]*\bid=["']wedding-music["'][^>]*?)\sautoplay(?=\s|>)/i,
    '$1'
  )
  .replace(/\bstartWeddingMusic\(\);?/g, '')

const addWeddingMusicOnOpen = (html) => {
  const script = '<script id="wedding-music-on-open">(()=>{const start=()=>{const audio=document.querySelector("#wedding-music");if(!audio)return;audio.loop=true;const result=audio.play();if(result?.catch)result.catch(()=>{})};document.addEventListener("DOMContentLoaded",()=>{const button=document.querySelector(".phone>.cover>.button");if(!button)return;button.addEventListener("click",()=>{const phone=document.querySelector(".phone");if(phone)phone.classList.add("invite-open");start()},{once:true})})})()</script>'
  return String(html || '').replace('</body>', `${script}</body>`)
}

export async function getWeddingExportHTML(project) {
  const rendered = disableWeddingMusicAutoplay(renderWeddingHTML(project))
  const withCoverSync = applyCoverPositionsToExport(rendered, project)
  const withEditorParity = applyWeddingEditorParity(withCoverSync, project)
  const withScrollAnimations = applyWeddingScrollAnimations(withEditorParity)
  const withClosingScrollSpace = addClosingScrollSpace(withScrollAnimations)
  const withWeddingMusic = addWeddingMusicOnOpen(withClosingScrollSpace)
  return embedWeddingFonts(withWeddingMusic)
}

export default getWeddingExportHTML
