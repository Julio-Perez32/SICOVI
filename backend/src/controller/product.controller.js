const { Product } = require("../model");
const { sanitizeProduct, sanitizeProducts } = require("../utils/sanitizeProduct");
const cloudinary = require("../utils/cloudinary");

const productController = {};

// GET /api/products?buscar=&categoria=&proveedor=&soloActivos=&pagina=&limite=
productController.getProducts = async (req, res) => {
  try {
    const { buscar, categoria, proveedor, soloActivos = "true" } = req.query;
    const pagina = Math.max(Number(req.query.pagina) || 1, 1);
    const limite = Math.min(Number(req.query.limite) || 20, 100);

    const filtro = {};
    if (soloActivos === "true") filtro.activo = true;
    if (categoria) filtro.categoria = categoria;
    if (proveedor) filtro.proveedor = proveedor;
    if (buscar) {
      filtro.$or = [
        { nombre: { $regex: buscar, $options: "i" } },
        { codigo: { $regex: buscar, $options: "i" } },
      ];
    }

    const [productos, total] = await Promise.all([
      Product.find(filtro)
        .populate("categoria", "nombre")
        .populate("proveedor", "nombre")
        .sort({ nombre: 1 })
        .skip((pagina - 1) * limite)
        .limit(limite),
      Product.countDocuments(filtro),
    ]);

    res.status(200).json({
      success: true,
      count: productos.length,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
      productos: sanitizeProducts(productos, req.user.rol),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/products/low-stock (admin)
productController.getLowStockProducts = async (req, res) => {
  try {
    const productos = await Product.find({
      activo: true,
      $expr: { $lte: ["$stock", "$stockMinimo"] },
    }).sort({ stock: 1 });

    res.status(200).json({ success: true, count: productos.length, productos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/products/:id
productController.getProduct = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id)
      .populate("categoria", "nombre")
      .populate("proveedor", "nombre");

    if (!producto) return res.status(404).json({ success: false, message: "Producto no encontrado" });

    res.status(200).json({ success: true, producto: sanitizeProduct(producto, req.user.rol) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/products (admin)
productController.createProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.imagen = req.file.path;
      data.imagenPublicId = req.file.filename;
    }

    const producto = await Product.create(data);
    res.status(201).json({ success: true, producto });
  } catch (error) {
    const status = error.code === 11000 ? 409 : 400;
    res.status(status).json({ success: false, message: error.code === 11000 ? "Ya existe un producto con ese código" : error.message });
  }
};

// PUT /api/products/:id (admin)
productController.updateProduct = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) return res.status(404).json({ success: false, message: "Producto no encontrado" });

    const camposEditables = [
      "codigo",
      "nombre",
      "descripcion",
      "categoria",
      "proveedor",
      "unidadMedida",
      "ubicacion",
      "precioCosto",
      "precioVenta",
      "stockMinimo",
      "activo",
    ];
    camposEditables.forEach((campo) => {
      if (req.body[campo] !== undefined) producto[campo] = req.body[campo];
    });

    if (req.file) {
      if (producto.imagenPublicId) {
        await cloudinary.uploader.destroy(producto.imagenPublicId).catch(() => {});
      }
      producto.imagen = req.file.path;
      producto.imagenPublicId = req.file.filename;
    }

    await producto.save();
    res.status(200).json({ success: true, producto });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/products/:id (admin) - borrado suave, para no romper compras/ventas históricas
productController.deleteProduct = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) return res.status(404).json({ success: false, message: "Producto no encontrado" });

    producto.activo = false;
    await producto.save();

    res.status(200).json({ success: true, message: "Producto desactivado" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = productController;
