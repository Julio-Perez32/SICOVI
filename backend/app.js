// app.js
// ------------------------------------------------------------------
// Aquí se arma la aplicación de Express: middlewares globales, todas
// las rutas de la API montadas bajo /api/... y el manejo de errores.
// Este archivo NO levanta el servidor (eso lo hace index.js) ni
// conecta la base de datos (eso lo hace database.js) - solo define
// "qué sabe hacer" la app. Si buscas un endpoint, este es el mapa.
// ------------------------------------------------------------------
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const config = require("./config");
const { notFound, errorHandler } = require("./src/middlewares/error.middleware");

// Rutas de cada módulo del sistema
const authRoutes = require("./src/routes/auth.routes");
const productRoutes = require("./src/routes/product.routes");
const categoryRoutes = require("./src/routes/category.routes");
const supplierRoutes = require("./src/routes/supplier.routes");
const purchaseRoutes = require("./src/routes/purchase.routes");
const saleRoutes = require("./src/routes/sale.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const notificationRoutes = require("./src/routes/notification.routes");

const app = express();

// --- Middlewares globales ---
app.use(
  cors({
    origin: [config.clientAdminUrl, config.clientEmployeeUrl],
    credentials: true, // necesario para que viaje la cookie httpOnly del JWT
  })
);
app.use(express.json());
app.use(cookieParser());
if (config.nodeEnv !== "test") {
  app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
}

// --- Healthcheck ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "SICOVI API funcionando" });
});

// --- Rutas de la API ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

// --- 404 y manejo de errores (siempre al final) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
