// Crea (o actualiza) el primer usuario administrador a partir de las
// variables ADMIN_SEED_* del .env. Se ejecuta a mano con:
//   npm run seed:admin
const mongoose = require("mongoose");
const connectDB = require("../../database");
const config = require("../../config");
const { User } = require("../model");

async function seedAdmin() {
  if (!config.adminSeed.email || !config.adminSeed.password) {
    console.error(
      "Faltan ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD en el .env, no se puede crear el admin."
    );
    process.exit(1);
  }

  await connectDB();

  const existente = await User.findOne({ email: config.adminSeed.email });

  if (existente) {
    existente.rol = "admin";
    existente.activo = true;
    await existente.save();
    console.log(`El usuario ${existente.email} ya existía, se aseguró que sea admin activo.`);
  } else {
    const admin = await User.create({
      nombre: config.adminSeed.nombre,
      email: config.adminSeed.email,
      password: config.adminSeed.password,
      rol: "admin",
    });
    console.log(`Admin creado: ${admin.email} (usa la contraseña definida en ADMIN_SEED_PASSWORD)`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error("Error al crear el admin:", error);
  process.exit(1);
});
