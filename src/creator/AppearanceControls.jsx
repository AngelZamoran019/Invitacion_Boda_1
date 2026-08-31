import { useState } from 'react'

export default function AppearanceControls({ project, set }) {
  const [open, setOpen] = useState(null)
  const appearance = project.appearance || {}
  const toggle = (id) => setOpen((current) => current === id ? null : id)

  return (
    <div className="appearance-editor">
      <label className="editor-field">
        <span>Nombre del proyecto</span>
        <input value={project.name || ''} onChange={(e) => set('name', e.target.value)} />
      </label>

      <div className="appearance-card">
        <strong>Apariencia</strong>
        <small>Configuración visual del proyecto.</small>

        <section className="appearance-dropdown">
          <button type="button" className="appearance-dropdown-summary" onClick={() => toggle('background')} aria-expanded={open === 'background'}>
            <strong>Fondo</strong>
            <b>⌄</b>
          </button>
          {open === 'background' && (
            <div className="appearance-dropdown-content">
              <small>La configuración del fondo permanece disponible.</small>
            </div>
          )}
        </section>

        <section className="appearance-texture-controls">
          <div className="appearance-texture-header">
            <strong>Textura fotográfica</strong>
            <small>La imagen cubrirá toda la pantalla, centrada y con zoom automático.</small>
          </div>
          <label className="appearance-texture-toggle">
            <input
              type="checkbox"
              checked={appearance.backgroundTextureType === 'image'}
              onChange={(e) => set('appearance.backgroundTextureType', e.target.checked ? 'image' : 'none')}
            />
            <span>Usar textura</span>
          </label>
          {appearance.backgroundTextureType === 'image' && (
            <>
              <label>
                URL de la textura
                <input
                  type="url"
                  value={appearance.backgroundTextureImage || ''}
                  onChange={(e) => set('appearance.backgroundTextureImage', e.target.value)}
                  placeholder="https://.../textura.jpg"
                />
              </label>
              <label>
                Opacidad
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={Number.isFinite(Number(appearance.backgroundTextureOpacity)) ? Number(appearance.backgroundTextureOpacity) : 0.28}
                  onChange={(e) => set('appearance.backgroundTextureOpacity', Number(e.target.value))}
                />
              </label>
              <label>
                Modo de mezcla
                <select
                  value={appearance.backgroundTextureBlend || 'soft-light'}
                  onChange={(e) => set('appearance.backgroundTextureBlend', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="soft-light">Soft Light</option>
                  <option value="hard-light">Hard Light</option>
                </select>
              </label>
            </>
          )}
        </section>

        <section className="appearance-dropdown">
          <button type="button" className="appearance-dropdown-summary" onClick={() => toggle('accent')} aria-expanded={open === 'accent'}>
            <strong>Acento</strong>
            <b>⌄</b>
          </button>
          {open === 'accent' && <div className="appearance-dropdown-content"><small>La configuración de acento permanece disponible.</small></div>}
        </section>

        <section className="appearance-dropdown">
          <button type="button" className="appearance-dropdown-summary" onClick={() => toggle('text')} aria-expanded={open === 'text'}>
            <strong>Texto base</strong>
            <b>⌄</b>
          </button>
          {open === 'text' && <div className="appearance-dropdown-content"><small>La configuración de texto base permanece disponible.</small></div>}
        </section>

        <section className="appearance-dropdown">
          <button type="button" className="appearance-dropdown-summary" onClick={() => toggle('typography')} aria-expanded={open === 'typography'}>
            <strong>Texto y tipografía</strong>
            <span>Sin elementos configurables</span>
            <b>⌄</b>
          </button>
          {open === 'typography' && (
            <div className="appearance-dropdown-content">
              <div className="appearance-empty-type-items">
                <strong>Sin elementos configurados</strong>
                <small>Los textos visibles de la invitación no se han eliminado. Iremos agregando cada texto y asignándolo a un elemento desde cero.</small>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
