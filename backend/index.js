// index.js
// ------------------------------------------------------------------
// Punto de entrada del backend: conecta la base de datos y luego
// levanta el servidor HTTP con la app definida en app.js.
// Para arrancar en desarrollo: npm run dev  (usa nodemon)
// Para arrancar en producción: npm start
// ------------------------------------------------------------------
const app = require("./app");
const connectDB = require("./database");
const config = require("./config");

async function start() {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`SICOVI backend escuchando en http://localhost:${config.port}`);
  });
}

start();
