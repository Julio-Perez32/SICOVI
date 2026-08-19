const { Category } = require("../model");
const { responderError } = require("../utils/traducirError");

const categoryController = {};

categoryController.getCategories = async (req, res) => {
  try {
    const categorias = await Category.find({ activo: true }).sort({ nombre: 1 });
    res.status(200).json({ success: true, count: categorias.length, categorias });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

categoryController.createCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: "El nombre de la categoría es obligatorio" });

    const categoria = await Category.create({ nombre, descripcion });
    res.status(201).json({ success: true, categoria });
  } catch (error) {
    responderError(res, error, "categoría");
  }
};

categoryController.updateCategory = async (req, res) => {
  try {
    const categoria = await Category.findById(req.params.id);
    if (!categoria) return res.status(404).json({ success: false, message: "Categoría no encontrada" });

    const { nombre, descripcion, activo } = req.body;
    if (nombre !== undefined) categoria.nombre = nombre;
    if (descripcion !== undefined) categoria.descripcion = descripcion;
    if (activo !== undefined) categoria.activo = activo;

    await categoria.save();
    res.status(200).json({ success: true, categoria });
  } catch (error) {
    responderError(res, error, "categoría");
  }
};

categoryController.deleteCategory = async (req, res) => {
  try {
    const categoria = await Category.findById(req.params.id);
    if (!categoria) return res.status(404).json({ success: false, message: "Categoría no encontrada" });

    categoria.activo = false;
    await categoria.save();
    res.status(200).json({ success: true, message: "Categoría desactivada" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = categoryController;
