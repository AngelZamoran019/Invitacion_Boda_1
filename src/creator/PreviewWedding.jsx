import { useEffect, useMemo, useRef } from 'react'
import { renderWeddingHTML } from '../export/renderWeddingHTML.js'

function PreviewWedding({ project }) {
  const iframeRef = useRef(null)
  const viewStateRef = useRef({ inviteOpen: false, scrollTop: 0, scrollLeft: 0 })

  const html = useMemo(() => {
    const rendered = renderWeddingHTML(project)
    const state = viewStateRef.current

    // Si el usuario ya abrió la invitación, el nuevo documento de la VP
    // nace directamente en esa página para evitar regresar visualmente a portada.
    if (state.inviteOpen) {
      return rendered.replace('<main class="phone">', '<main class="phone invite-open">')
    }

    return rendered
  }, [project])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return undefined

    const captureState = () => {
      try {
        const doc = iframe.contentDocument
        const phone = doc?.querySelector('.phone')
        if (!phone) return

        viewStateRef.current = {
          inviteOpen: phone.classList.contains('invite-open'),
          scrollTop: phone.scrollTop,
          scrollLeft: phone.scrollLeft,
        }
      } catch {
        // El documento de la VP puede estar cambiando mientras se actualiza.
      }
    }

    const restoreState = () => {
      try {
        const doc = iframe.contentDocument
        const phone = doc?.querySelector('.phone')
        if (!phone) return

        const state = viewStateRef.current

        if (state.inviteOpen) {
          phone.classList.add('invite-open')
        }

        const restoreScroll = () => {
          phone.scrollTop = state.scrollTop || 0
          phone.scrollLeft = state.scrollLeft || 0
        }

        restoreScroll()
        requestAnimationFrame(restoreScroll)
        setTimeout(restoreScroll, 50)

        const onScroll = () => {
          viewStateRef.current = {
            inviteOpen: phone.classList.contains('invite-open'),
            scrollTop: phone.scrollTop,
            scrollLeft: phone.scrollLeft,
          }
        }

        phone.addEventListener('scroll', onScroll, { passive: true })

        const observer = new MutationObserver(() => {
          viewStateRef.current.inviteOpen = phone.classList.contains('invite-open')
        })
        observer.observe(phone, { attributes: true, attributeFilter: ['class'] })

        iframe.__previewCleanup = () => {
          phone.removeEventListener('scroll', onScroll)
          observer.disconnect()
        }
      } catch {
        // Ignorar durante la navegación interna del iframe.
      }
    }

    const onLoad = () => {
      iframe.__previewCleanup?.()
      restoreState()
    }

    iframe.addEventListener('load', onLoad)

    return () => {
      captureState()
      iframe.removeEventListener('load', onLoad)
      iframe.__previewCleanup?.()
      iframe.__previewCleanup = null
    }
  }, [html])

  return (
    <iframe
      ref={iframeRef}
      className="wedding-preview-frame"
      title="Vista previa de la invitación"
      srcDoc={html}
      scrolling="yes"
    />
  )
}

export default PreviewWedding
