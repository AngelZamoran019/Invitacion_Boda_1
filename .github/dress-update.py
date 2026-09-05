from pathlib import Path
import re

p = Path('src/creator/EditorWedding.jsx')
t = p.read_text()
start = t.index("case 'dressCode':")
end = t.index("case 'gifts':", start)
block = t[start:end]
repls = {
'Título de sección': '<CoverTextEditor label="Título de sección" value={dress.sectionTitle ?? \'Código de vestimenta\'} onChange={(v) => set(\'dressCode.sectionTitle\', v)} color={dress.sectionTitleColor} mode={dress.sectionTitleMode} gradient={dress.sectionTitleGradient} size={dress.sectionTitleSize} font={dress.sectionTitleFont} positionY={dress.sectionTitlePositionY} set={set} prefix="dressCode.sectionTitle" defaultSize={11} />',
'Subtítulo': '<CoverTextEditor label="Subtítulo" value={dress.subtitle ?? \'Elegancia para celebrar\'} onChange={(v) => set(\'dressCode.subtitle\', v)} color={dress.subtitleColor} mode={dress.subtitleMode} gradient={dress.subtitleGradient} size={dress.subtitleSize} font={dress.subtitleFont} positionY={dress.subtitlePositionY} set={set} prefix="dressCode.subtitle" defaultSize={32} />',
'Hombres': '<CoverTextEditor label="Hombres" value={dress.menLabel ?? \'Ellas\'} onChange={(v) => set(\'dressCode.menLabel\', v)} color={dress.menLabelColor} mode={dress.menLabelMode} gradient={dress.menLabelGradient} size={dress.menLabelSize} font={dress.menLabelFont} positionY={dress.menLabelPositionY} set={set} prefix="dressCode.menLabel" defaultSize={12} />',
'Mujeres': '<CoverTextEditor label="Mujeres" value={dress.womenLabel ?? \'Ellos\'} onChange={(v) => set(\'dressCode.womenLabel\', v)} color={dress.womenLabelColor} mode={dress.womenLabelMode} gradient={dress.womenLabelGradient} size={dress.womenLabelSize} font={dress.womenLabelFont} positionY={dress.womenLabelPositionY} set={set} prefix="dressCode.womenLabel" defaultSize={12} />',
'Vestimenta hombre': '<CoverTextEditor label="Vestimenta hombre" value={dress.menAttire ?? dress.men ?? \'Formal\'} onChange={(v) => set(\'dressCode.menAttire\', v)} color={dress.menAttireColor} mode={dress.menAttireMode} gradient={dress.menAttireGradient} size={dress.menAttireSize} font={dress.menAttireFont} positionY={dress.menAttirePositionY} set={set} prefix="dressCode.menAttire" defaultSize={12} />',
'Vestimenta Mujeres': '<CoverTextEditor label="Vestimenta Mujeres" value={dress.womenAttire ?? dress.women ?? \'Formal\'} onChange={(v) => set(\'dressCode.womenAttire\', v)} color={dress.womenAttireColor} mode={dress.womenAttireMode} gradient={dress.womenAttireGradient} size={dress.womenAttireSize} font={dress.womenAttireFont} positionY={dress.womenAttirePositionY} set={set} prefix="dressCode.womenAttire" defaultSize={12} />',
'Nota': '<CoverTextEditor label="Nota" value={dress.note ?? \'\'} onChange={(v) => set(\'dressCode.note\', v)} multiline color={dress.noteColor} mode={dress.noteMode} gradient={dress.noteGradient} size={dress.noteSize} font={dress.noteFont} positionY={dress.notePositionY} set={set} prefix="dressCode.note" defaultSize={12} />'
}
for label, replacement in repls.items():
    match = re.search(r'<TextField label="' + re.escape(label) + r'"[\s\S]*?/>', block)
    if not match:
        raise SystemExit(f'Field not found: {label}')
    block = block[:match.start()] + replacement + block[match.end():]
p.write_text(t[:start] + block + t[end:])

p = Path('src/data/weddingSchema.js')
t = p.read_text()
old = "dressCode:{enabled:true,sectionTitle:'Código de vestimenta',subtitle:'Elegancia para celebrar',menLabel:'Ellas',womenLabel:'Ellos',menAttire:'Formal',womenAttire:'Formal',note:''}"
new = "dressCode:{enabled:true,sectionTitle:'Código de vestimenta',sectionTitleColor:'#ffffff',sectionTitleMode:'solid',sectionTitleGradient:'',sectionTitleSize:11,sectionTitleFont:'Arial',sectionTitlePositionY:0,subtitle:'Elegancia para celebrar',subtitleColor:'#ffffff',subtitleMode:'solid',subtitleGradient:'',subtitleSize:32,subtitleFont:'Arial',subtitlePositionY:0,menLabel:'Ellas',menLabelColor:'#ffffff',menLabelMode:'solid',menLabelGradient:'',menLabelSize:12,menLabelFont:'Arial',menLabelPositionY:0,womenLabel:'Ellos',womenLabelColor:'#ffffff',womenLabelMode:'solid',womenLabelGradient:'',womenLabelSize:12,womenLabelFont:'Arial',womenLabelPositionY:0,menAttire:'Formal',menAttireColor:'#ffffff',menAttireMode:'solid',menAttireGradient:'',menAttireSize:12,menAttireFont:'Arial',menAttirePositionY:0,womenAttire:'Formal',womenAttireColor:'#ffffff',womenAttireMode:'solid',womenAttireGradient:'',womenAttireSize:12,womenAttireFont:'Arial',womenAttirePositionY:0,note:'',noteColor:'#ffffff',noteMode:'solid',noteGradient:'',noteSize:12,noteFont:'Arial',notePositionY:0}"
if old in t: t = t.replace(old, new, 1)
p.write_text(t)

p = Path('src/export/weddingOutput.js')
t = p.read_text()
if 'const applyDressCodeContentStyles = ' not in t:
    marker = "const applyGiftsFields = (html, project) => {"
    helper = '''const applyDressCodeContentStyles = (html, project) => {
  const dress = project?.dressCode || {}
  const safeColor = (value, fallback = '#ffffff') => /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback
  const safeGradient = (value) => typeof value === 'string' && value.includes('gradient(') && (value.match(/#[0-9a-fA-F]{6}/g) || []).length >= 2 ? value : ''
  const safeSize = (value, fallback) => { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : fallback }
  const safePosition = (value) => { const number = Number(value); return Number.isFinite(number) ? Math.max(-300, Math.min(300, number)) : 0 }
  const fontFamily = (value, fallback = 'Arial') => getWeddingFontFamily(value || fallback)
  const paint = (mode, color, gradient) => {
    const safeGradientValue = safeGradient(gradient)
    if (mode === 'gradient' && safeGradientValue) return 'background:' + safeGradientValue + '!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important;'
    const safeColorValue = safeColor(color)
    return 'background:none!important;color:' + safeColorValue + '!important;-webkit-text-fill-color:' + safeColorValue + '!important;'
  }
  const style = (prefix, fallbackSize = 12) => paint(dress[prefix + 'Mode'], dress[prefix + 'Color'], dress[prefix + 'Gradient']) + 'font-family:' + fontFamily(dress[prefix + 'Font']) + '!important;font-size:' + safeSize(dress[prefix + 'Size'], fallbackSize) + 'px!important;position:relative!important;top:' + safePosition(dress[prefix + 'PositionY']) + 'px!important;'
  const source = String(html || '')
  const sections = source.match(/<section\s+class=["']section["'][^>]*>[\s\S]*?<\/section>/gi) || []
  const target = sections.find((section) => /<p\s+class=["']eyebrow["'][^>]*>\s*(?:Código de vestimenta|Elegancia para celebrar)\s*<\/p>/i.test(section) && /<div\s+class=["']dress-card["']/i.test(section))
  if (!target) return source
  const marked = source.replace(target, target.replace(/^<section\s+class=["']section["']/, '<section class="section dress-code-content-section"'))
  const css = '<style id="wedding-dress-code-content-styles">' +
    '.phone>.section.dress-code-content-section>.eyebrow{' + style('sectionTitle',11) + '}' +
    '.phone>.section.dress-code-content-section>h2{' + style('subtitle',32) + '}' +
    '.phone>.section.dress-code-content-section>.dress-card:nth-of-type(1)>span{' + style('menLabel',12) + '}' +
    '.phone>.section.dress-code-content-section>.dress-card:nth-of-type(2)>span{' + style('womenLabel',12) + '}' +
    '.phone>.section.dress-code-content-section>.dress-card:nth-of-type(1)>strong{' + style('menAttire',12) + '}' +
    '.phone>.section.dress-code-content-section>.dress-card:nth-of-type(2)>strong{' + style('womenAttire',12) + '}' +
    '.phone>.section.dress-code-content-section>.note{' + style('note',12) + '}' +
    '</style>'
  if (marked.includes('id="wedding-dress-code-content-styles"')) return marked.replace(/<style id="wedding-dress-code-content-styles">[\s\S]*?<\/style>/i, css)
  return marked.replace('</head>', css + '</head>')
}

'''
    if marker not in t: raise SystemExit('Output marker missing')
    t = t.replace(marker, helper + marker, 1)
old = "const withCountdownContentStyles = applyCountdownContentStyles(withEventContentStyles, project)\n  const withFonts = applyWeddingFonts(withCountdownContentStyles, project)"
new = "const withCountdownContentStyles = applyCountdownContentStyles(withEventContentStyles, project)\n  const withDressCodeContentStyles = applyDressCodeContentStyles(withCountdownContentStyles, project)\n  const withFonts = applyWeddingFonts(withDressCodeContentStyles, project)"
if old in t: t = t.replace(old, new, 1)
p.write_text(t)
