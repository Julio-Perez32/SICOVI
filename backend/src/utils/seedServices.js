// Carga servicios de ejemplo típicos de un taller, para poder probar la
// facturación sin tener que teclearlos uno por uno.
// Se ejecuta a mano con:
//   npm run seed:servicios
const mongoose = require("mongoose");
const connectDB = require("../../database");
const { Service } = require("../model");

const SERVICIOS = [
  { codigo: "SRV001", nombre: "Cambio de aceite y filtro", descripcion: "Mano de obra del cambio de aceite y filtro (no incluye los materiales)", precio: 12.0, duracionMinutos: 30 },
  { codigo: "SRV002", nombre: "Alineación y balanceo", descripcion: "Alineación de dirección y balanceo de las 4 llantas", precio: 25.0, duracionMinutos: 60 },
  { codigo: "SRV003", nombre: "Rotación de llantas", descripcion: "Rotación de las 4 llantas", precio: 8.0, duracionMinutos: 25 },
  { codigo: "SRV004", nombre: "Cambio de pastillas de freno", descripcion: "Mano de obra por eje", precio: 20.0, duracionMinutos: 60 },
  { codigo: "SRV005", nombre: "Rectificado de discos", descripcion: "Rectificado de discos de freno por eje", precio: 18.0, duracionMinutos: 45 },
  { codigo: "SRV006", nombre: "Diagnóstico por escáner", descripcion: "Lectura y borrado de códigos de falla", precio: 15.0, duracionMinutos: 30 },
  { codigo: "SRV007", nombre: "Cambio de batería", descripcion: "Instalación y prueba del sistema de carga", precio: 6.0, duracionMinutos: 20 },
  { codigo: "SRV008", nombre: "Cambio de refrigerante", descripcion: "Drenado y llenado del sistema de enfriamiento", precio: 14.0, duracionMinutos: 40 },
  { codigo: "SRV009", nombre: "Revisión general de 20 puntos", descripcion: "Chequeo de niveles, frenos, luces, llantas y suspensión", precio: 10.0, duracionMinutos: 40 },
  { codigo: "SRV010", nombre: "Montaje de llanta", descripcion: "Desmontaje, montaje y balanceo por llanta", precio: 5.0, duracionMinutos: 15 },
];

async function seedServices() {
  await connectDB();

  let creados = 0;
  let existentes = 0;

  for (const datos of SERVICIOS) {
    const existente = await Service.findOne({ codigo: datos.codigo });
    if (existente) {
      existentes += 1;
      continue;
    }
    await Service.create(datos);
    creados += 1;
  }

  console.log(`Servicios de ejemplo: ${creados} creados, ${existentes} ya existían.`);

  await mongoose.connection.close();
  process.exit(0);
}

seedServices().catch((error) => {
  console.error("Error al crear los servicios de ejemplo:", error);
  process.exit(1);
});
