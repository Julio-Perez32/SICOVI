const { Notification } = require("../model");

const notificationController = {};

// GET /api/notifications?leida=false (admin)
notificationController.getNotifications = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.leida !== undefined) filtro.leida = req.query.leida === "true";

    const notificaciones = await Notification.find(filtro)
      .populate("producto", "codigo nombre stock stockMinimo")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notificaciones.length, notificaciones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/notifications/:id/read (admin)
notificationController.markAsRead = async (req, res) => {
  try {
    const notificacion = await Notification.findById(req.params.id);
    if (!notificacion) return res.status(404).json({ success: false, message: "Notificación no encontrada" });

    notificacion.leida = true;
    await notificacion.save();

    res.status(200).json({ success: true, notificacion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = notificationController;
