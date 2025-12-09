// controllers/producto/tipo_producto_controller.js
import { pool } from '../../db.js';

// Crear tipo de producto
export const createTipoProducto = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: "Faltan datos obligatorios", data: null, errors:["El campo 'nombre' es obligatorio"] });

    const [result] = await pool.query('INSERT INTO tipo_producto (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion || null]);
    const [rows] = await pool.query('SELECT * FROM tipo_producto WHERE id_tipo_producto = ?', [result.insertId]);

    return res.status(201).json({ success: true, message: "Tipo de producto creado", data: rows[0], errors: [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success:false, message:"Error en el servidor", data:null, errors:[error.message] });
  }
};

// Listar todos los tipos de producto
export const listTipoProductos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tipo_producto ORDER BY id_tipo_producto DESC');
    return res.json({ success:true, message:"Lista de tipos de producto", data:rows, errors:[] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success:false, message:"Error en el servidor", data:null, errors:[error.message] });
  }
};

// Obtener tipo de producto por id
export const getTipoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tipo_producto WHERE id_tipo_producto = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success:false, message:"Tipo de producto no encontrado", data:null, errors:["No existe"] });
    return res.json({ success:true, message:"Tipo de producto obtenido", data:rows[0], errors:[] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success:false, message:"Error en el servidor", data:null, errors:[error.message] });
  }
};

// Actualizar tipo de producto
export const updateTipoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const [result] = await pool.query('UPDATE tipo_producto SET nombre=?, descripcion=? WHERE id_tipo_producto=?', [nombre, descripcion || null, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success:false, message:"Tipo de producto no encontrado", data:null, errors:["No existe"] });
    const [rows] = await pool.query('SELECT * FROM tipo_producto WHERE id_tipo_producto=?', [id]);
    return res.json({ success:true, message:"Tipo de producto actualizado", data:rows[0], errors:[] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success:false, message:"Error en el servidor", data:null, errors:[error.message] });
  }
};

// Eliminar tipo de producto
export const deleteTipoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tipo_producto WHERE id_tipo_producto=?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success:false, message:"Tipo de producto no encontrado", data:null, errors:["No existe"] });
    return res.json({ success:true, message:"Tipo de producto eliminado", data:{id:Number(id)}, errors:[] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success:false, message:"Error en el servidor", data:null, errors:[error.message] });
  }
};
