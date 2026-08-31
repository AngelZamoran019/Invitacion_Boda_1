import { useEffect, useRef } from 'react'
import { renderWeddingHTML } from '../export/renderWeddingHTML.js'

const INITIAL_STATE = {
  inviteOpen: false,
  scrollTop: 0,
  scrollLeft: 0,
}

function PreviewWedding({ project }) {
  const iframeRef = useRef(null)
  const viewStateRef = useRef({ ...INITIAL_STATE })
  const firstRenderRef = useRef(true)
  const projectRef = useRef(project)

  projectRef.current = project

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return undefined

    const captureState = () => {
      try {
        const doc = iframe.contentDocument
        if (!doc) return

        const phone = doc.querySelector('.phone')
        const scrollingElement = doc.scrollingElement || doc.documentElement

        if (!phone && !scrollingElement) return

        const target = phone || scrollingElement

        viewStateRef.current = {
          inviteOpen: Boolean(phone?.classList.contains('invite-open')),
          scrollTop: target.scrollTop || 0,
          scrollLeft: target.scrollLeft || 0,
        }
      } catch {
        // El iframe puede estar en proceso de actualización.
      }
    }

    const restoreState = () => {
      try {
        const doc = iframe.contentDocument
        if (!doc) return

        const phone = doc.querySelector('.phone')
        const scrollingElement = doc.scrollingElement || doc.documentElement
        const state = viewStateRef.current

        if (!phone && !scrollingElement) return

        if (state.inviteOpen && phone) {
          phone.classList.add('invite-open')
        }

        const restoreScroll = () => {
          const currentPhone = doc.querySelector('.phone')
          const currentScrollingElement = doc.scrollingElement || doc.documentElement
          const target = currentPhone || currentScrollingElement

          if (!target) return

          target.scrollTop = state.scrollTop || 0
          target.scrollLeft = state.scrollLeft || 0

          if (doc.defaultView) {
            doc.defaultView.scrollTo(state.scrollLeft || 0, state.scrollTop || 0)
          }
        }

        restoreScroll()
        requestAnimationFrame(restoreScroll)
        requestAnimationFrame(() => requestAnimationFrame(restoreScroll))
        setTimeout(restoreScroll, 50)
        setTimeout(restoreScroll, 150)

        const onScroll = () => {
          const currentPhone = doc.querySelector('.phone')
          const currentScrollingElement = doc.scrollingElement || doc.documentElement
          const target = currentPhone || currentScrollingElement

          if (!target) return

          viewStateRef.current = {
            inviteOpen: Boolean(currentPhone?.classList.contains('invite-open')),
            scrollTop: target.scrollTop || 0,
            scrollLeft: target.scrollLeft || 0,
          }
        }

        const scrollTargets = [phone, scrollingElement, doc.defaultView].filter(Boolean)
        scrollTargets.forEach((target) => target.addEventListener('scroll', onScroll, { passive: true }))

        const observer = phone
          ? new MutationObserver(() => {
              viewStateRef.current.inviteOpen = phone.classList.contains('invite-open')
            })
          : null

        observer?.observe(phone, { attributes: true, attributeFilter: ['class'] })

        iframe.__previewCleanup = () => {
          scrollTargets.forEach((target) => target.removeEventListener('scroll', onScroll))
          observer?.disconnect()
        }
      } catch {
        // Ignorar durante la carga o reconstrucción del documento.
      }
    }

    const renderIntoIframe = () => {
      try {
        // IMPORTANTE: el iframe no recibe srcDoc dinámico desde React.
        // Así nunca se desmonta ni se recrea el elemento al editar el proyecto.
        // Capturamos el scroll antes de reemplazar su documento.
        if (!firstRenderRef.current) {
          captureState()
        }

        const rendered = renderWeddingHTML(projectRef.current)
        const state = viewStateRef.current
        const html = state.inviteOpen
          ? rendered.replace('<main class="phone">', '<main class="phone invite-open">')
          : rendered

        iframe.__previewCleanup?.()

        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (!doc) return

        doc.open()
        doc.write(html)
        doc.close()

        firstRenderRef.current = false

        const onReady = () => {
          restoreState()
        }

        if (doc.readyState === 'loading') {
          doc.addEventListener('DOMContentLoaded', onReady, { once: true })
        } else {
          onReady()
        }
      } catch {
        // Mantener la VP viva aunque el documento se encuentre cambiando.
      }
    }

    renderIntoIframe()

    return () => {
      captureState()
      iframe.__previewCleanup?.()
      iframe.__previewCleanup = null
    }
  }, [project])

  return (
    <iframe
      ref={iframeRef}
      className="wedding-preview-frame"
      title="Vista previa de la invitación"
      scrolling="yes"
    />
  )
}

export default PreviewWedding
