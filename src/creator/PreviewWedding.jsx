import { useLayoutEffect, useMemo, useRef } from 'react'
import { renderWeddingHTML } from '../export/renderWeddingHTML.js'

function PreviewWedding({ project }) {
  const iframeRef = useRef(null)
  const viewStateRef = useRef({
    inviteOpen: false,
    scrollTop: 0,
    scrollLeft: 0,
  })

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

  useLayoutEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return undefined

    const getScrollState = () => {
      try {
        const doc = iframe.contentDocument
        const phone = doc?.querySelector('.phone')
        if (!phone) return null

        // .phone es el contenedor principal de scroll de la invitación.
        // También contemplamos html/body/window para que el estado no se
        // pierda si cambia alguna regla de overflow en el futuro.
        const scrollTop = Math.max(
          Number(phone.scrollTop) || 0,
          Number(doc.documentElement?.scrollTop) || 0,
          Number(doc.body?.scrollTop) || 0,
          Number(iframe.contentWindow?.scrollY) || 0,
        )

        const scrollLeft = Math.max(
          Number(phone.scrollLeft) || 0,
          Number(doc.documentElement?.scrollLeft) || 0,
          Number(doc.body?.scrollLeft) || 0,
          Number(iframe.contentWindow?.scrollX) || 0,
        )

        return {
          inviteOpen: phone.classList.contains('invite-open'),
          scrollTop,
          scrollLeft,
        }
      } catch {
        return null
      }
    }

    const captureState = () => {
      const state = getScrollState()
      if (state) {
        viewStateRef.current = state
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
          const top = Number(state.scrollTop) || 0
          const left = Number(state.scrollLeft) || 0

          phone.scrollTop = top
          phone.scrollLeft = left

          if (doc.documentElement) {
            doc.documentElement.scrollTop = top
            doc.documentElement.scrollLeft = left
          }

          if (doc.body) {
            doc.body.scrollTop = top
            doc.body.scrollLeft = left
          }

          iframe.contentWindow?.scrollTo(left, top)
        }

        // El iframe puede terminar de calcular el layout después de load.
        // Por eso restauramos en varios frames sin alterar la posición del usuario.
        restoreScroll()
        requestAnimationFrame(restoreScroll)
        requestAnimationFrame(() => requestAnimationFrame(restoreScroll))
        setTimeout(restoreScroll, 50)
        setTimeout(restoreScroll, 150)

        const onScroll = () => {
          const nextState = getScrollState()
          if (nextState) {
            viewStateRef.current = nextState
          }
        }

        phone.addEventListener('scroll', onScroll, { passive: true })
        doc.addEventListener('scroll', onScroll, { passive: true, capture: true })

        const observer = new MutationObserver(() => {
          viewStateRef.current.inviteOpen = phone.classList.contains('invite-open')
        })
        observer.observe(phone, {
          attributes: true,
          attributeFilter: ['class'],
        })

        iframe.__previewCleanup = () => {
          phone.removeEventListener('scroll', onScroll)
          doc.removeEventListener('scroll', onScroll, true)
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

    // useLayoutEffect es intencional: su cleanup captura la posición ANTES
    // de que React cambie srcDoc y el iframe vuelva a cargar.
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
