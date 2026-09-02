const clampPosition = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.max(-300, Math.min(300, number))
}

export function applyCoverPositionsToExport(html, project) {
  const cover = project?.coverSection || {}
  const positions = {
    ornament: clampPosition(cover.ornamentPositionY),
    eyebrow: clampPosition(cover.eyebrowPositionY),
    title: clampPosition(cover.titlePositionY),
    date: clampPosition(cover.datePositionY),
    button: clampPosition(cover.buttonPositionY),
    line: clampPosition(cover.linePositionY),
  }

  const script = `<script id="wedding-cover-positions-export">(()=>{const positions=${JSON.stringify(positions)};const apply=()=>{const cover=document.querySelector('.phone>.cover');if(!cover)return;const selectors={ornament:'.ornament',eyebrow:'.eyebrow',title:'h1',date:'.date',button:'.button',line:'.line'};Object.entries(selectors).forEach(([key,selector])=>{const el=cover.querySelector(selector);if(el)el.style.setProperty('top',String(positions[key])+'px','important')})};if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',apply,{once:true})}else{apply()}})()</script>`

  return String(html || '').replace('</body>', `${script}</body>`)
}

export default applyCoverPositionsToExport
