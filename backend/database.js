const mongoose = require("mongoose");
const config = require("./config");

async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(config.dbUri);
    console.log(`MongoDB conectado: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB desconectado");
});

module.exports = connectDB;
