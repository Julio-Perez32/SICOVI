const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  dbUri: process.env.DB_URI,
  jwtSecret: process.env.JWT_Secret_Key,

  clientAdminUrl: process.env.CLIENT_ADMIN_URL || "http://localhost:5173",
  clientEmployeeUrl: process.env.CLIENT_EMPLOYEE_URL || "http://localhost:5174",

  email: {
    user: process.env.USER_EMAIL,
    password: process.env.USER_PASSWORD,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  adminSeed: {
    nombre: process.env.ADMIN_SEED_NAME || "Administrador SICOVI",
    email: process.env.ADMIN_SEED_EMAIL,
    password: process.env.ADMIN_SEED_PASSWORD,
  },

  defaultStockMinimo: Number(process.env.DEFAULT_STOCK_MINIMO) || 5,
};

module.exports = config;
