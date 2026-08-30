import { buildWeddingHTML } from './exportWedding.js'

const escCssUrl = value => String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/</g, '%3C').replace(/>/g, '%3E')

export function renderWeddingHTML(project) {
  let html = buildWeddingHTML(project)
  const appearance = project?.appearance || {}
  const texture = appearance.backgroundTextureImage || ''
  const enabled = appearance.backgroundTextureType === 'image' && Boolean(texture)

  if (!enabled) return html

  const opacity = Math.max(0, Math.min(1, Number(appearance.backgroundTextureOpacity ?? 0.28)))
  const blend = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light'].includes(appearance.backgroundTextureBlend)
    ? appearance.backgroundTextureBlend
    : 'soft-light'
  const size = appearance.backgroundTextureSize || 'cover'
  const position = appearance.backgroundTexturePosition || 'center'
  const url = escCssUrl(texture)

  // La textura vive en una capa independiente que cubre TODO el contenido
  // desplazable del teléfono. Así no queda limitada al primer viewport.
  const textureCss = `<style id="wedding-global-texture">
    .phone{position:relative;isolation:isolate;}
    .global-texture-layer{position:absolute;left:0;top:0;width:100%;height:100%;min-height:100%;z-index:0;pointer-events:none;background-image:url("${url}");background-size:${size};background-position:${position};background-repeat:no-repeat;background-attachment:scroll;opacity:${opacity};mix-blend-mode:${blend};}
    .phone > *:not(.global-texture-layer){position:relative;z-index:1;}
  </style>`
  const textureLayer = '<div class="global-texture-layer" aria-hidden="true"></div>'
  const textureScript = `<script>(function(){function sizeTexture(){const p=document.querySelector('.phone'),t=document.querySelector('.global-texture-layer');if(p&&t)t.style.height=Math.max(p.scrollHeight,p.clientHeight)+'px'}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',sizeTexture)}else{sizeTexture()}window.addEventListener('resize',sizeTexture);setTimeout(sizeTexture,50);setTimeout(sizeTexture,300);setTimeout(sizeTexture,1000);const p=document.querySelector('.phone');if(p&&window.ResizeObserver){new ResizeObserver(sizeTexture).observe(p)}})();</script>`

  return html.replace('<main class="phone">', `<main class="phone">${textureLayer}`).replace('</body>', `${textureScript}</body>`)
}

export default renderWeddingHTML
