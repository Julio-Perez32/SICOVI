// Datos del taller que salen en la orden de servicio.
// Tomados de la plantilla real de ODM -- este es el único archivo que hay
// que tocar si algo de esto cambia.
//
// Ojo: SICOVI es el nombre del SISTEMA; ODM es el taller. En los documentos
// que ve el cliente va la marca del taller, no la del sistema.
export const taller = {
  nombre: 'ODM',
  subtitulo: 'SERVICIO MECÁNICO',
  direccion: 'km 9 ½ Carretera de Oro',
  telefono: '(503) 6035-1049',
  redes: '@ODMIMPORTACIONES',

  // Los precios del catálogo NO llevan IVA: la orden lo dice explícitamente
  // y el total es la simple suma de los importes.
  notaPrecios: 'PRECIOS NO INCLUYE IVA',

  // Nombre del sistema. Va discreto al pie de la app (no en los documentos
  // que ve el cliente, ahí solo aparece la marca del taller).
  sistema: 'SICOVI',
  sistemaDescripcion: 'Sistema de Control de Compras, Ventas e Inventario',
}
