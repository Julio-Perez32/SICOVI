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
let ratio = 1
if (ext === '.png') {
  // Cabecera IHDR de un PNG: ancho y alto en los bytes 16..24
  const ancho = buf.readUInt32BE(16)
  const alto = buf.readUInt32BE(20)
  if (ancho && alto) ratio = ancho / alto
}

const salida = `// Logo de ODM para la orden de servicio, guardado como data URL para que el
// PDF se pueda generar sin esperar a que cargue ninguna imagen.
//
// ⚠️ ARCHIVO GENERADO -- no lo edites a mano.
// Para reemplazar el logo:  npm run logo -- "C:/ruta/al/logo.png"
export const logoOdm = '${dataUrl}'

// Proporción ancho/alto del logo, para dibujarlo sin deformarlo.
export const logoOdmRatio = ${ratio.toFixed(4)}
`

fs.writeFileSync('src/assets/logoOdm.js', salida)
console.log(`Logo incrustado (${(buf.length / 1024).toFixed(1)} KB, proporción ${ratio.toFixed(2)}).`)
console.log('Ya sale en la orden de servicio -- recargá la página.')
