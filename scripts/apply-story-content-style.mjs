import fs from 'node:fs'

const editorPath = 'src/creator/EditorWedding.jsx'
let editor = fs.readFileSync(editorPath, 'utf8')
const editorOld = `case 'story': return <div className="editor-grid"><TextField label="Título de sección" value={project.story.sectionTitle ?? 'Nuestra historia'} onChange={(v) => set('story.sectionTitle', v)} /><TextField label="Subtítulo" value={project.story.title} onChange={(v) => set('story.title', v)} /><TextField label="Historia" value={project.story.text} onChange={(v) => set('story.text', v)} multiline /><TextField label="Imagen 1 (URL)" value={project.story.images[0] || ''} onChange={(v) => set('story.images', [v, ...project.story.images.slice(1)])} placeholder="https://..." /></div>`
const editorNew = `case 'story': { const story = project.story || {}; return <div className="editor-grid"><CoverTextEditor label="Título de sección" value={story.sectionTitle ?? 'Nuestra historia'} onChange={(v) => set('story.sectionTitle', v)} color={story.sectionTitleColor} mode={story.sectionTitleMode} gradient={story.sectionTitleGradient} size={story.sectionTitleSize} font={story.sectionTitleFont} positionY={story.sectionTitlePositionY} set={set} prefix="story.sectionTitle" defaultSize={11} /><CoverTextEditor label="Subtítulo" value={story.title} onChange={(v) => set('story.title', v)} color={story.titleColor} mode={story.titleMode} gradient={story.titleGradient} size={story.titleSize} font={story.titleFont} positionY={story.titlePositionY} set={set} prefix="story.title" defaultSize={32} /><CoverTextEditor label="Historia" value={story.text} onChange={(v) => set('story.text', v)} multiline color={story.textColor} mode={story.textMode} gradient={story.textGradient} size={story.textSize} font={story.textFont} positionY={story.textPositionY} set={set} prefix="story.text" defaultSize={16} /><TextField label="Imagen 1 (URL)" value={story.images?.[0] || ''} onChange={(v) => set('story.images', [v, ...(story.images || []).slice(1)])} placeholder="https://..." /></div> }`
if (!editor.includes(editorOld)) throw new Error('Editor story block not found')
editor = editor.replace(editorOld, editorNew)
fs.writeFileSync(editorPath, editor)

const schemaPath = 'src/data/weddingSchema.js'
let schema = fs.readFileSync(schemaPath, 'utf8')
const schemaOld = `story:{sectionTitle:'Nuestra historia',title:'Nuestra historia',text:'',images:[]},`
const schemaNew = `story:{sectionTitle:'Nuestra historia',sectionTitleColor:'#ffffff',sectionTitleMode:'solid',sectionTitleGradient:'',sectionTitleSize:11,sectionTitleFont:'Arial',sectionTitlePositionY:0,title:'Nuestra historia',titleColor:'#ffffff',titleMode:'solid',titleGradient:'',titleSize:32,titleFont:'Arial',titlePositionY:0,text:'',textColor:'#ffffff',textMode:'solid',textGradient:'',textSize:16,textFont:'Arial',textPositionY:0,images:[]},`
if (!schema.includes(schemaOld)) throw new Error('Schema story block not found')
schema = schema.replace(schemaOld, schemaNew)
fs.writeFileSync(schemaPath, schema)

const outputPath = 'src/export/weddingOutput.js'
let output = fs.readFileSync(outputPath, 'utf8')
const marker = `const applyCoupleContentStyles = (html, project) => {`
const helper = `const applyStoryContentStyles = (html, project) => {
  const story = project?.story || {}
  const safeColor = (value, fallback = '#ffffff') => /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback
  const safeGradient = (value) => typeof value === 'string' && value.includes('gradient(') && (value.match(/#[0-9a-fA-F]{6}/g) || []).length >= 2 ? value : ''
  const safeSize = (value, fallback) => { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : fallback }
  const safePosition = (value) => { const number = Number(value); return Number.isFinite(number) ? Math.max(-300, Math.min(300, number)) : 0 }
  const fontFamily = (value) => getWeddingFontFamily(value || 'Arial')
  const paint = (mode, color, gradient) => {
    const safeGradientValue = safeGradient(gradient)
    if (mode === 'gradient' && safeGradientValue) return 'background:' + safeGradientValue + '!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important;'
    const safeColorValue = safeColor(color)
    return 'background:none!important;color:' + safeColorValue + '!important;-webkit-text-fill-color:' + safeColorValue + '!important;'
  }
  const source = String(html || '')
  const sectionTitle = escapeHtml(story.sectionTitle || 'Nuestra historia')
  const sections = source.match(/<section\\s+class=["']section["'][^>]*>[\\s\\S]*?<\\/section>/gi) || []
  const escapedTitle = sectionTitle.replace(/[.*+?^()|[\\]\\\\]/g, '\\\\$&')
  const target = sections.find((section) => new RegExp('<p\\\\s+class=["']eyebrow["'][^>]*>\\\\s*' + escapedTitle + '\\\\s*<\\\\/p>', 'i').test(section))
  if (!target) return source
  const marked = source.replace(target, target.replace(/^<section\\s+class=["']section["']/, '<section class="section story-content-section"'))
  const css = '<style id="wedding-story-content-styles">.phone>.section.story-content-section>.eyebrow{' + paint(story.sectionTitleMode,story.sectionTitleColor,story.sectionTitleGradient) + 'font-family:' + fontFamily(story.sectionTitleFont) + '!important;font-size:' + safeSize(story.sectionTitleSize,11) + 'px!important;position:relative!important;top:' + safePosition(story.sectionTitlePositionY) + 'px!important;}.phone>.section.story-content-section>h2{' + paint(story.titleMode,story.titleColor,story.titleGradient) + 'font-family:' + fontFamily(story.titleFont) + '!important;font-size:' + safeSize(story.titleSize,32) + 'px!important;position:relative!important;top:' + safePosition(story.titlePositionY) + 'px!important;}.phone>.section.story-content-section>.text{' + paint(story.textMode,story.textColor,story.textGradient) + 'font-family:' + fontFamily(story.textFont) + '!important;font-size:' + safeSize(story.textSize,16) + 'px!important;position:relative!important;top:' + safePosition(story.textPositionY) + 'px!important;}</style>'
  if (marked.includes('id="wedding-story-content-styles"')) return marked.replace(/<style id="wedding-story-content-styles">[\\s\\S]*?<\\/style>/i, css)
  return marked.replace('</head>', css + '</head>')
}

`
if (output.includes(marker)) {
  if (!output.includes('const applyStoryContentStyles = (html, project) => {')) output = output.replace(marker, helper + marker)
} else throw new Error('Output helper marker not found')
const outputOld = `const withCoupleContentStyles = applyCoupleContentStyles(withCoverPositions, project)\n  const withFonts = applyWeddingFonts(withCoupleContentStyles, project)`
const outputNew = `const withCoupleContentStyles = applyCoupleContentStyles(withCoverPositions, project)\n  const withStoryContentStyles = applyStoryContentStyles(withCoupleContentStyles, project)\n  const withFonts = applyWeddingFonts(withStoryContentStyles, project)`
if (!output.includes(outputOld) && !output.includes('const withStoryContentStyles = applyStoryContentStyles')) throw new Error('Output style chain not found')
output = output.replace(outputOld, outputNew)
fs.writeFileSync(outputPath, output)
