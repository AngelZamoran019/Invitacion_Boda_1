import { buildWeddingHTML } from '../export/exportWedding.js'

function PreviewWedding({ project }) {
  const html = buildWeddingHTML(project)

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
