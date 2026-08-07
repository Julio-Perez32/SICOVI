const nodemailer = require("nodemailer");
const config = require("../../config");

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }
  return transporter;
}

// Envío de correo "best effort": si falla (credenciales mal puestas, sin
// internet, etc.) solo se registra en consola, nunca debe tumbar la petición
// que lo disparó (ej. registrar una venta no debe fallar porque el correo
// de alerta no salió).
async function sendEmail({ to, subject, html }) {
  if (!config.email.user || !config.email.password) {
    console.warn("sendEmail: USER_EMAIL/USER_PASSWORD no configurados, se omite el envío");
    return;
  }
  try {
    await getTransporter().sendMail({
      from: `"SICOVI" <${config.email.user}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`sendEmail: no se pudo enviar el correo a ${to}: ${error.message}`);
  }
}

module.exports = sendEmail;
