const { Service } = require("../model");
const { responderError } = require("../utils/traducirError");

const serviceController = {};

// GET /api/services?buscar=&soloActivos=
serviceController.getServices = async (req, res) => {
  try {
    const { buscar, soloActivos = "true" } = req.query;

    const filtro = {};
    if (soloActivos === "true") filtro.activo = true;
    if (buscar) {
      filtro.$or = [
        { nombre: { $regex: buscar, $options: "i" } },
        { codigo: { $regex: buscar, $options: "i" } },
      ];
    }

    const servicios = await Service.find(filtro).sort({ nombre: 1 });
    res.status(200).json({ success: true, count: servicios.length, servicios });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/services (admin)
serviceController.createService = async (req, res) => {
  try {
    const { codigo, nombre, descripcion, precio, duracionMinutos } = req.body;

    if (!codigo || !nombre) {
      return res.status(400).json({ success: false, message: "El código y el nombre son obligatorios" });
    }

    const servicio = await Service.create({
      codigo,
      nombre,
      descripcion,
      precio: Number(precio) || 0,
      duracionMinutos: duracionMinutos ? Number(duracionMinutos) : null,
    });

    res.status(201).json({ success: true, servicio });
  } catch (error) {
    responderError(res, error, "servicio");
  }
};

// PUT /api/services/:id (admin)
serviceController.updateService = async (req, res) => {
  try {
    const servicio = await Service.findById(req.params.id);
    if (!servicio) return res.status(404).json({ success: false, message: "Servicio no encontrado" });

    const campos = ["codigo", "nombre", "descripcion", "precio", "duracionMinutos", "activo"];
    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) servicio[campo] = req.body[campo];
    });

    await servicio.save();
    res.status(200).json({ success: true, servicio });
  } catch (error) {
    responderError(res, error, "servicio");
  }
};

// DELETE /api/services/:id (admin) - borrado suave, para no romper las
// ventas históricas que ya cobraron ese servicio
serviceController.deleteService = async (req, res) => {
  try {
    const servicio = await Service.findById(req.params.id);
    if (!servicio) return res.status(404).json({ success: false, message: "Servicio no encontrado" });

    servicio.activo = false;
    await servicio.save();

    res.status(200).json({ success: true, message: "Servicio desactivado" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = serviceController;
