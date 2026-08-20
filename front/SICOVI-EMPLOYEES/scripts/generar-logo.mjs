// Convierte el PNG del logo de ODM en un data URL y regenera
// src/assets/logoOdm.js, para que el PDF lo pueda incrustar sin cargas async.
//
// Uso:  npm run logo -- "C:/ruta/al/logo.png"
import fs from 'fs'
import path from 'path'

const origen = process.argv[2]

if (!origen) {
  console.error('Falta la ruta del logo.\n  Uso: npm run logo -- "C:/ruta/al/logo.png"')
  process.exit(1)
}
if (!fs.existsSync(origen)) {
  console.error(`No encontré el archivo: ${origen}`)
  process.exit(1)
}

const ext = path.extname(origen).toLowerCase()
const TIPOS = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' }
if (!TIPOS[ext]) {
  console.error(`Formato no soportado (${ext}). Usá PNG o JPG.`)
  process.exit(1)
}

const buf = fs.readFileSync(origen)
const dataUrl = `data:${TIPOS[ext]};base64,${buf.toString('base64')}`

// Se lee el tamaño real para no deformar el logo al dibujarlo.
function medirPng(b) {
  // Cabecera IHDR: ancho y alto en los bytes 16..24
  return { ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20) }
}

function medirJpeg(b) {
  // Se recorren los segmentos hasta encontrar un SOF, que es el que trae
  // las dimensiones reales de la imagen.
  let i = 2
  while (i < b.length - 9) {
    if (b[i] !== 0xff) { i += 1; continue }
    const marca = b[i + 1]
    const esSOF = (marca >= 0xc0 && marca <= 0xc3) || (marca >= 0xc5 && marca <= 0xc7) ||
                  (marca >= 0xc9 && marca <= 0xcb) || (marca >= 0xcd && marca <= 0xcf)
    if (esSOF) return { alto: b.readUInt16BE(i + 5), ancho: b.readUInt16BE(i + 7) }
    i += 2 + b.readUInt16BE(i + 2)
  }
  return { ancho: 0, alto: 0 }
}

let ratio = 1
const { ancho, alto } = ext === '.png' ? medirPng(buf) : medirJpeg(buf)
if (ancho && alto) ratio = ancho / alto
else console.warn('No pude leer el tamaño de la imagen; se asume cuadrada.')

const salida = `// Logo de ODM para la orden de servicio, guardado como data URL para que el
// PDF se pueda generar sin esperar a que cargue ninguna imagen.
//
// ⚠️ ARCHIVO GENERADO -- no lo edites a mano.
// Para reemplazar el logo:  npm run logo -- "C:/ruta/al/logo.png"
export const logoOdm = '${dataUrl}'

// Proporción ancho/alto del logo, para dibujarlo sin deformarlo.
export const logoOdmRatio = ${ratio.toFixed(4)}

// Formato, para que jsPDF sepa cómo incrustarlo.
export const logoOdmFormato = '${ext === '.png' ? 'PNG' : 'JPEG'}'
`

fs.writeFileSync('src/assets/logoOdm.js', salida)
console.log(`Logo incrustado: ${ancho}x${alto}px, ${(buf.length / 1024).toFixed(1)} KB (proporción ${ratio.toFixed(2)}).`)
console.log('Ya sale en la orden de servicio -- recargá la página.')
