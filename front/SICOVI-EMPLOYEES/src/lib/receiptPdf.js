import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { taller } from '../config/taller'
import { logoOdm, logoOdmRatio } from '../assets/logoOdm'
import { formatCurrency } from './format'

// Genera la ORDEN DE SERVICIO en PDF, replicando la plantilla de ODM.
// Se dibuja por código (no como captura de pantalla) para que el texto
// quede seleccionable, salga nítido al imprimir y el archivo pese poco.

const NEGRO = [0, 0, 0]
const BLANCO = [255, 255, 255]
const GRIS_LINEA = [90, 90, 90]
const AZUL_ENGRANAJE = [176, 198, 220]
const NARANJA = [247, 148, 29]

const MARGEN = 14
const ANCHO_PAGINA = 210
const ALTO_PAGINA = 297
const ANCHO_UTIL = ANCHO_PAGINA - MARGEN * 2

// ------------------------------------------------------------- decoración

// Dibuja un engranaje como polígono de dientes alternando radio externo e
// interno. Son los adornos del formato de ODM.
function engranaje(doc, cx, cy, rExt, rInt, dientes, color, { relleno = false, grosor = 1.2 } = {}) {
  const puntos = []
  const paso = Math.PI / dientes

  for (let i = 0; i < dientes * 2; i += 1) {
    const r = i % 2 === 0 ? rExt : rInt
    const a = i * paso
    puntos.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }

  const deltas = puntos.slice(1).map((p, i) => [p[0] - puntos[i][0], p[1] - puntos[i][1]])

  doc.setDrawColor(...color)
  doc.setFillColor(...color)
  doc.setLineWidth(grosor)
  doc.lines(deltas, puntos[0][0], puntos[0][1], [1, 1], relleno ? 'F' : 'S', true)

  // agujero del centro
  if (relleno) {
    doc.setFillColor(...BLANCO)
    doc.circle(cx, cy, rInt * 0.42, 'F')
  } else {
    doc.circle(cx, cy, rInt * 0.5, 'S')
  }
}

function adornosDeFondo(doc) {
  // Engranajes tenues en los márgenes, como en la plantilla.
  engranaje(doc, 197, 96, 16, 11, 9, AZUL_ENGRANAJE, { grosor: 1.6 })
  engranaje(doc, 13, 152, 12, 8.5, 8, AZUL_ENGRANAJE, { grosor: 1.4 })
  engranaje(doc, 201, 190, 10, 7, 8, AZUL_ENGRANAJE, { grosor: 1.3 })
}

function engranajesDelPie(doc, y) {
  const cx = ANCHO_PAGINA / 2
  engranaje(doc, cx, y, 6.5, 4.4, 8, NARANJA, { relleno: true })
  engranaje(doc, cx - 11, y + 2.5, 4.2, 2.8, 7, NARANJA, { relleno: true })
  engranaje(doc, cx + 11, y + 2.5, 4.2, 2.8, 7, NARANJA, { relleno: true })

  doc.setFillColor(...NARANJA)
  doc.rect(cx - 26, y + 5.4, 52, 1, 'F')
}

// -------------------------------------------------------------- secciones

function encabezado(doc, venta) {
  // --- Logo (o su espacio en blanco mientras no esté) ---
  const cajaLogo = { x: MARGEN + 10, y: 14, alto: 26 }
  if (logoOdm) {
    const ancho = cajaLogo.alto * (logoOdmRatio || 1)
    doc.addImage(logoOdm, 'PNG', cajaLogo.x, cajaLogo.y, ancho, cajaLogo.alto)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...NEGRO)
    doc.text(taller.subtitulo, cajaLogo.x + ancho / 2, cajaLogo.y + cajaLogo.alto + 6, { align: 'center' })
  } else {
    // Sin logo todavía: solo el nombre, sin marcos ni recuadros de relleno.
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(30)
    doc.setTextColor(...NEGRO)
    doc.text(taller.nombre, cajaLogo.x, cajaLogo.y + 17)

    doc.setFontSize(9)
    doc.text(taller.subtitulo, cajaLogo.x, cajaLogo.y + 25)
  }

  // --- Título ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(25)
  doc.setTextColor(...NEGRO)
  doc.text('ORDEN DE', ANCHO_PAGINA - MARGEN, 24, { align: 'right' })
  doc.text('SERVICIO', ANCHO_PAGINA - MARGEN, 35, { align: 'right' })

  // --- Caja ORDEN NO. ---
  const anchoCaja = 62
  const xCaja = ANCHO_PAGINA - MARGEN - anchoCaja

  doc.setFillColor(...NEGRO)
  doc.rect(xCaja, 44, anchoCaja, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...BLANCO)
  doc.text('ORDEN NO.', xCaja + anchoCaja / 2, 49.4, { align: 'center', charSpace: 0.3 })

  doc.setDrawColor(...NEGRO)
  doc.setLineWidth(0.5)
  doc.rect(xCaja, 52, anchoCaja, 11, 'S')
  doc.setFontSize(14)
  doc.setTextColor(...NEGRO)
  doc.text(venta.numeroComprobante || '—', xCaja + anchoCaja / 2, 59.6, { align: 'center' })
}

function datosCliente(doc, venta, y) {
  const altoFila = 10
  const xCorte = MARGEN + 108 // donde empieza el bloque de FECHA
  const anchoFecha = ANCHO_PAGINA - MARGEN - xCorte

  doc.setDrawColor(...NEGRO)
  doc.setLineWidth(0.5)

  // Marco de las dos filas
  doc.rect(MARGEN, y, ANCHO_UTIL, altoFila * 2, 'S')
  doc.line(MARGEN, y + altoFila, ANCHO_PAGINA - MARGEN, y + altoFila)
  doc.line(xCorte, y, xCorte, y + altoFila * 2)

  // NOMBRE / VEHICULO
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NEGRO)
  doc.text('NOMBRE:', MARGEN + 4, y + 6.5)
  doc.text('VEHICULO:', MARGEN + 4, y + altoFila + 6.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(venta.cliente || 'Consumidor final', MARGEN + 30, y + 6.5)
  doc.text(venta.vehiculo || '—', MARGEN + 30, y + altoFila + 6.5)

  // Encabezado FECHA (negro) + celdas día / mes / año
  doc.setFillColor(...NEGRO)
  doc.rect(xCorte, y, anchoFecha, altoFila, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BLANCO)
  doc.text('FECHA', xCorte + anchoFecha / 2, y + 6.5, { align: 'center', charSpace: 0.3 })

  const f = new Date(venta.fecha)
  const partes = [
    String(f.getDate()).padStart(2, '0'),
    String(f.getMonth() + 1).padStart(2, '0'),
    String(f.getFullYear()),
  ]
  const anchoCelda = anchoFecha / 3

  doc.setTextColor(...NEGRO)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  partes.forEach((parte, i) => {
    const x = xCorte + anchoCelda * i
    if (i > 0) doc.line(x, y + altoFila, x, y + altoFila * 2)
    doc.text(parte, x + anchoCelda / 2, y + altoFila + 6.5, { align: 'center' })
  })

  return y + altoFila * 2
}

function tablaItems(doc, venta, y) {
  const items = venta.items || []

  autoTable(doc, {
    startY: y,
    head: [['CANTIDAD', 'DESCRIPCIÓN', 'VALOR UNITARIO', 'IMPORTE']],
    body: items.map((it) => [
      String(it.cantidad),
      it.nombre,
      formatCurrency(it.precioVentaUnitario),
      formatCurrency(it.subtotal),
    ]),
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: { top: 2.4, bottom: 2.4, left: 3, right: 3 },
      textColor: NEGRO,
      lineColor: GRIS_LINEA,
      lineWidth: 0.25,
      minCellHeight: 7.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: NEGRO,
      textColor: BLANCO,
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      lineWidth: 0.25,
      lineColor: NEGRO,
      cellPadding: { top: 2.8, bottom: 2.8, left: 3, right: 3 },
    },
    columnStyles: {
      0: { cellWidth: 26, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 34, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: MARGEN, right: MARGEN, bottom: 45 },
    tableWidth: ANCHO_UTIL,
  })

  return doc.lastAutoTable.finalY
}

function filaTotal(doc, venta, y) {
  const alto = 11
  const anchoImporte = 30
  const anchoEtiqueta = 34
  const xEtiqueta = ANCHO_PAGINA - MARGEN - anchoImporte - anchoEtiqueta

  // "TOTAL" sobre fondo negro, alineado con la columna VALOR UNITARIO
  doc.setFillColor(...NEGRO)
  doc.rect(xEtiqueta, y, anchoEtiqueta, alto, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...BLANCO)
  doc.text('TOTAL', xEtiqueta + anchoEtiqueta / 2, y + 7.8, { align: 'center' })

  // Importe, alineado con la columna IMPORTE
  doc.setDrawColor(...GRIS_LINEA)
  doc.setLineWidth(0.25)
  doc.rect(ANCHO_PAGINA - MARGEN - anchoImporte, y, anchoImporte, alto, 'S')
  doc.setTextColor(...NEGRO)
  doc.setFontSize(12)
  doc.text(formatCurrency(venta.total), ANCHO_PAGINA - MARGEN - 3, y + 7.6, { align: 'right' })

  // Los precios no llevan IVA -- así lo dice el formato de ODM.
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NEGRO)
  doc.text(taller.notaPrecios, ANCHO_PAGINA / 2, y + alto + 7, { align: 'center', charSpace: 0.2 })

  return y + alto + 7
}

function pie(doc) {
  const y = ALTO_PAGINA - 26
  const columnas = [
    { titulo: 'DIRECCIÓN', valor: taller.direccion, x: MARGEN + ANCHO_UTIL * 0.17 },
    { titulo: 'TELÉFONO', valor: taller.telefono, x: MARGEN + ANCHO_UTIL * 0.5 },
    { titulo: 'REDES', valor: taller.redes, x: MARGEN + ANCHO_UTIL * 0.83 },
  ]

  columnas.forEach(({ titulo, valor, x }) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...NEGRO)
    doc.text(titulo, x, y, { align: 'center', charSpace: 0.2 })

    doc.setFontSize(8.5)
    doc.text(valor, x, y + 6, { align: 'center' })
  })
}

// --------------------------------------------------------------- principal

// Arma el documento y lo devuelve, sin guardarlo ni imprimirlo. Está
// separado para poder generarlo/probarlo fuera del navegador.
export function construirComprobantePdf(venta) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  adornosDeFondo(doc)
  encabezado(doc, venta)

  let y = datosCliente(doc, venta, 70) + 8
  y = tablaItems(doc, venta, y)

  // Si el total no cabe en lo que queda de hoja, se pasa a la siguiente.
  if (y + 20 > ALTO_PAGINA - 45) {
    doc.addPage()
    adornosDeFondo(doc)
    y = 24
  }
  filaTotal(doc, venta, y)

  // El pie va en todas las páginas si la orden se extendió
  const paginas = doc.getNumberOfPages()
  for (let i = 1; i <= paginas; i += 1) {
    doc.setPage(i)
    engranajesDelPie(doc, ALTO_PAGINA - 38)
    pie(doc)
    if (paginas > 1) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...GRIS_LINEA)
      doc.text(`Página ${i} de ${paginas}`, ANCHO_PAGINA - MARGEN, ALTO_PAGINA - 8, { align: 'right' })
    }
  }

  return doc
}

// accion: 'descargar' (default) | 'imprimir'
export function generarComprobantePdf(venta, accion = 'descargar') {
  const doc = construirComprobantePdf(venta)
  const nombre = `orden-servicio-${venta.numeroComprobante || 'odm'}.pdf`

  if (accion === 'imprimir') {
    doc.autoPrint()
    window.open(doc.output('bloburl'), '_blank')
  } else {
    doc.save(nombre)
  }
}
