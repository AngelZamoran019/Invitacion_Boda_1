import { renderWeddingHTML } from '../export/renderWeddingHTML.js'

function PreviewWedding({ project }) {
  const html = renderWeddingHTML(project)

  return (
    <iframe
      className="wedding-preview-frame"
      title="Vista previa de la invitación"
      srcDoc={html}
      scrolling="yes"
    />
  )
}

export default PreviewWedding
