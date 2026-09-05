export const WEDDING_FONTS = [
  { value: 'Arial', label: 'Arial', file: null, format: null },
  { value: 'Amoresa', label: 'Amoresa', file: 'Andrey-Sharonov-Amoresa-Regular.otf', format: 'opentype' },
  { value: 'Barbara Blast', label: 'Barbara Blast', file: 'Barbara-Blast.ttf', format: 'truetype' },
  { value: 'Baxcattery Groonkey', label: 'Baxcattery Groonkey', file: 'BaxcatteryGroonkey-E4wYW-Exfont3f36.otf', format: 'opentype' },
  { value: 'Birthstone', label: 'Birthstone', file: 'Birthstone-Regular-Exfont7a12.ttf', format: 'truetype' },
  { value: 'Blak Slab', label: 'Blak Slab', file: 'Blak_Slab.otf', format: 'opentype' },
  { value: 'Calligraphy', label: 'Calligraphy', file: 'Calligraphy-5yAza-Exfontdbd0.otf', format: 'opentype' },
  { value: 'Corsiva', label: 'Corsiva', file: 'Corsiva-Regular.ttf', format: 'truetype' },
  { value: 'Dreamy Romance', label: 'Dreamy Romance', file: 'DreamyRomanceRegularDemo-lxmJe-Exfontb5de.ttf', format: 'truetype' },
  { value: 'Espada del Destino', label: 'Espada del Destino', file: 'EspadaDelDestino.otf', format: 'opentype' },
  { value: 'Kompot Display', label: 'Kompot Display', file: 'KompotDisplay-Display-Exfontf18a.otf', format: 'opentype' },
  { value: 'RIKY Vamp', label: 'RIKY Vamp', file: 'RIKY2vamp.ttf', format: 'truetype' },
  { value: 'Remonta del Caido', label: 'Remonta del Caido', file: 'Remonta-Del-Caido.otf', format: 'opentype' },
  { value: 'Romantic', label: 'Romantic', file: 'Romantic-E4wg4-Exfont5798.otf', format: 'opentype' },
  { value: 'Saktere', label: 'Saktere', file: 'SaktereDemo-1j364-Exfont4c55.otf', format: 'opentype' },
  { value: 'Sunshine Surprise', label: 'Sunshine Surprise', file: 'Sunshine-Surprise-Exfont5b2d.ttf', format: 'truetype' },
  { value: 'Tickets', label: 'Tickets', file: 'TicketsRegular-j9wyj-Exfont5562.ttf', format: 'truetype' },
  { value: 'UTM Karate', label: 'UTM Karate', file: 'UTM-Karate-Regular.ttf', format: 'truetype' },
  { value: 'Vintage', label: 'Vintage', file: 'Vintage-ZpAXJ-Exfontb4d5.otf', format: 'opentype' },
  { value: 'VN Monotype Corsiva', label: 'VN Monotype Corsiva', file: 'VNmonotype-corsiva-Italic.ttf', format: 'truetype' },
]

export const WEDDING_FONT_FACE_CSS = WEDDING_FONTS
  .filter(font => font.file)
  .map(font => `@font-face{font-family:'${font.value}';src:url('/fonts/${font.file}') format('${font.format}');font-style:normal;font-weight:400;font-display:block;}`)
  .join('\n')

export const getWeddingFontFamily = value => {
  const font = WEDDING_FONTS.find(item => item.value === value)
  return font ? `'${font.value}', cursive` : 'Arial, Helvetica, sans-serif'
}
