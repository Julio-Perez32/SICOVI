const { Supplier } = require("../model");

const supplierController = {};

supplierController.getSuppliers = async (req, res) => {
  try {
    const proveedores = await Supplier.find({ activo: true }).sort({ nombre: 1 });
    res.status(200).json({ success: true, count: proveedores.length, proveedores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

supplierController.createSupplier = async (req, res) => {
  try {
    const { nombre, nit, nrc, direccion, telefono, email } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: "El nombre del proveedor es obligatorio" });

    const proveedor = await Supplier.create({ nombre, nit, nrc, direccion, telefono, email });
    res.status(201).json({ success: true, proveedor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

supplierController.updateSupplier = async (req, res) => {
  try {
    const proveedor = await Supplier.findById(req.params.id);
    if (!proveedor) return res.status(404).json({ success: false, message: "Proveedor no encontrado" });

    const campos = ["nombre", "nit", "nrc", "direccion", "telefono", "email", "activo"];
    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) proveedor[campo] = req.body[campo];
    });

    await proveedor.save();
    res.status(200).json({ success: true, proveedor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

supplierController.deleteSupplier = async (req, res) => {
  try {
    const proveedor = await Supplier.findById(req.params.id);
    if (!proveedor) return res.status(404).json({ success: false, message: "Proveedor no encontrado" });

    proveedor.activo = false;
    await proveedor.save();
    res.status(200).json({ success: true, message: "Proveedor desactivado" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = supplierController;
