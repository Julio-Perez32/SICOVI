// Crea (o asegura) la cuenta compartida de ventas -- el único usuario con
// rol "empleado" que usa todo el que esté en caja para registrar ventas.
// Se ejecuta a mano con:
//   npm run seed:empleado
const mongoose = require("mongoose");
const connectDB = require("../../database");
const config = require("../../config");
const { User } = require("../model");

async function seedEmployee() {
  if (!config.employeeSeed.email || !config.employeeSeed.password) {
    console.error(
      "Faltan EMPLOYEE_SEED_EMAIL / EMPLOYEE_SEED_PASSWORD en el .env, no se puede crear la cuenta de ventas."
    );
    process.exit(1);
  }

  await connectDB();

  const existente = await User.findOne({ email: config.employeeSeed.email });

  if (existente) {
    existente.rol = "empleado";
    existente.activo = true;
    if (!existente.username) existente.username = config.employeeSeed.username;
    await existente.save();
    console.log(
      `La cuenta ${existente.email} ya existía, se aseguró que sea empleado activo (usuario: ${existente.username}).`
    );
  } else {
    const empleado = await User.create({
      nombre: config.employeeSeed.nombre,
      email: config.employeeSeed.email,
      username: config.employeeSeed.username,
      password: config.employeeSeed.password,
      rol: "empleado",
    });
    console.log(
      `Cuenta de ventas creada: usuario "${empleado.username}" (usa la contraseña definida en EMPLOYEE_SEED_PASSWORD)`
    );
  }

  await mongoose.connection.close();
  process.exit(0);
}

seedEmployee().catch((error) => {
  console.error("Error al crear la cuenta de ventas:", error);
  process.exit(1);
});
