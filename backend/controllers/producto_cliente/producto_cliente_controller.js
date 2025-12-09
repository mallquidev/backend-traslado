// controllers/producto/producto_cliente_controller.js
import { pool } from "../../db.js";

// Crear producto del traslado
// Crear producto del traslado
export const createProductoCliente = async (req, res) => {
  try {
    const {
      id_traslado,
      id_usuario,         // NUEVO
      nombre,
      descripcion,
      peso,
      alto,
      ancho,
      largo,
      cantidad = 1,
      id_tipo_producto,
      id_tarifa
    } = req.body;

    let errors = [];
    if (!id_traslado) errors.push("El campo 'id_traslado' es obligatorio");
    if (!id_usuario) errors.push("El campo 'id_usuario' es obligatorio");  // NUEVO
    if (!nombre) errors.push("El campo 'nombre' es obligatorio");
    if (!peso) errors.push("El campo 'peso' es obligatorio");
    if (!alto) errors.push("El campo 'alto' es obligatorio");
    if (!ancho) errors.push("El campo 'ancho' es obligatorio");
    if (!largo) errors.push("El campo 'largo' es obligatorio");
    if (!id_tipo_producto) errors.push("El campo 'id_tipo_producto' es obligatorio");
    if (!id_tarifa) errors.push("El campo 'id_tarifa' es obligatorio");

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios",
        data: null,
        errors
      });
    }

    // Obtener tarifa para calcular precio
    const [tarifaRows] = await pool.query(
      "SELECT * FROM tarifa WHERE id_tarifa = ?",
      [id_tarifa]
    );

    if (tarifaRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tarifa no encontrada",
        data: null,
        errors: ["No existe una tarifa con ese id"]
      });
    }

    const tarifa = tarifaRows[0];
    const precio_unitario =
      Number(tarifa.precio_base) +
      Number(peso) * Number(tarifa.precio_por_kg) +
      ((Number(alto) * Number(ancho) * Number(largo)) / 1000000) * Number(tarifa.precio_por_m3) +
      Number(tarifa.recargo_fragil || 0) +
      Number(tarifa.recargo_especial || 0);

    // Insertar producto
    const [result] = await pool.query(
      `INSERT INTO producto_cliente (
        id_traslado,
        id_usuario,
        nombre,
        descripcion,
        peso,
        alto,
        ancho,
        largo,
        cantidad,
        id_tipo_producto,
        id_tarifa,
        precio_unitario
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_traslado, id_usuario, nombre, descripcion, peso, alto, ancho, largo, cantidad, id_tipo_producto, id_tarifa, precio_unitario]
    );

    const id_producto = result.insertId;

    // Traer producto insertado con info adicional del tipo, tarifa y usuario
    const [rows] = await pool.query(
      `SELECT p.*,
              tp.nombre AS tipo_producto_nombre,
              t.nombre AS tarifa_nombre,
              u.nombres AS usuario_nombres,
              u.apellidos AS usuario_apellidos,
              u.dni AS usuario_dni
       FROM producto_cliente p
       LEFT JOIN tipo_producto tp ON p.id_tipo_producto = tp.id_tipo_producto
       LEFT JOIN tarifa t ON p.id_tarifa = t.id_tarifa
       LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
       WHERE p.id_producto = ?`,
      [id_producto]
    );

    return res.status(201).json({
      success: true,
      message: "Producto registrado correctamente",
      data: rows[0],
      errors: []
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor",
      data: null,
      errors: [error.message]
    });
  }
};

// Listar todos los productos
// Listar todos los productos con info del cliente
export const listProductoClientes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*,
              u.nombres AS cliente_nombres,
              u.apellidos AS cliente_apellidos,
              u.dni AS cliente_dni,
              u.celular AS cliente_celular,
              tp.nombre AS tipo_producto_nombre,
              t.nombre AS tarifa_nombre
       FROM producto_cliente p
       LEFT JOIN traslado tr ON p.id_traslado = tr.id_traslado
       LEFT JOIN usuario u ON tr.id_usuario = u.id_usuario
       LEFT JOIN tipo_producto tp ON p.id_tipo_producto = tp.id_tipo_producto
       LEFT JOIN tarifa t ON p.id_tarifa = t.id_tarifa
       ORDER BY p.id_producto DESC`
    );

    return res.json({
      success: true,
      message: "Lista de productos",
      data: rows,
      errors: []
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor",
      data: null,
      errors: [error.message]
    });
  }
};

// Obtener producto por ID con info del cliente
export const getProductoCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*,
              u.nombres AS cliente_nombres,
              u.apellidos AS cliente_apellidos,
              u.dni AS cliente_dni,
              u.celular AS cliente_celular,
              tp.nombre AS tipo_producto_nombre,
              t.nombre AS tarifa_nombre
       FROM producto_cliente p
       LEFT JOIN traslado tr ON p.id_traslado = tr.id_traslado
       LEFT JOIN usuario u ON tr.id_usuario = u.id_usuario
       LEFT JOIN tipo_producto tp ON p.id_tipo_producto = tp.id_tipo_producto
       LEFT JOIN tarifa t ON p.id_tarifa = t.id_tarifa
       WHERE p.id_producto = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
        data: null,
        errors: ["No existe un producto con ese ID"]
      });
    }

    return res.json({
      success: true,
      message: "Producto obtenido",
      data: rows[0],
      errors: []
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor",
      data: null,
      errors: [error.message]
    });
  }
};


// Actualizar producto
export const updateProductoCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_traslado,
      nombre,
      descripcion,
      peso,
      alto,
      ancho,
      largo,
      cantidad,
      id_tipo_producto,
      id_tarifa
    } = req.body;

    const [result] = await pool.query(
      `UPDATE producto_cliente SET
        id_traslado = ?,
        nombre = ?,
        descripcion = ?,
        peso = ?,
        alto = ?,
        ancho = ?,
        largo = ?,
        cantidad = ?,
        id_tipo_producto = ?,
        id_tarifa = ?
      WHERE id_producto = ?`,
      [
        id_traslado,
        nombre,
        descripcion,
        peso,
        alto,
        ancho,
        largo,
        cantidad,
        id_tipo_producto,
        id_tarifa,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
        data: null,
        errors: ["No existe un producto con ese ID"]
      });
    }

    const [updated] = await pool.query(
      `SELECT * FROM producto_cliente WHERE id_producto = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: "Producto actualizado",
      data: updated[0],
      errors: []
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor",
      data: null,
      errors: [error.message]
    });
  }
};

// Eliminar producto
export const deleteProductoCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `DELETE FROM producto_cliente WHERE id_producto = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
        data: null,
        errors: ["No existe un producto con ese ID"]
      });
    }

    return res.json({
      success: true,
      message: "Producto eliminado",
      data: { id: Number(id) },
      errors: []
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor",
      data: null,
      errors: [error.message]
    });
  }
};