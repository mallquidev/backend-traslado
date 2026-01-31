import { pool } from '../../db.js';

// Crear tarifa
export const createTarifa = async (req, res) => {
  try {
    const {
      nombre,
      precio_base,
      precio_por_kg,
      precio_por_m3,
      recargo_fragil,
      recargo_especial,
      precio_por_km,
      descripcion
    } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios",
        data: null,
        errors: ["El campo 'nombre' es obligatorio"]
      });
    }

    const [result] = await pool.query(
      `INSERT INTO tarifa 
        (nombre, precio_base, precio_por_kg, precio_por_m3, recargo_fragil, recargo_especial, precio_por_km, descripcion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        precio_base || 0,
        precio_por_kg || 0,
        precio_por_m3 || 0,
        recargo_fragil || 0,
        recargo_especial || 0,
        precio_por_km || 0,
        descripcion || null
      ]
    );

    const [rows] = await pool.query('SELECT * FROM tarifa WHERE id_tarifa = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: "Tarifa creada correctamente",
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

// Listar todas las tarifas
export const listTarifas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tarifa ORDER BY id_tarifa DESC');
    return res.json({ success: true, message: "Lista de tarifas", data: rows, errors: [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error en el servidor", data: null, errors: [error.message] });
  }
};

// Obtener tarifa por id
export const getTarifa = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tarifa WHERE id_tarifa = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success:false, message:"Tarifa no encontrada", data:null, errors:["No existe"] });
    return res.json({ success:true, message:"Tarifa obtenida", data:rows[0], errors:[] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success:false, message:"Error en el servidor", data:null, errors:[error.message] });
  }
};

// Actualizar tarifa
export const updateTarifa = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      precio_base,
      precio_por_kg,
      precio_por_m3,
      recargo_fragil,
      recargo_especial,
      precio_por_km,
      descripcion
    } = req.body;

    const [result] = await pool.query(
      `UPDATE tarifa SET
        nombre = ?,
        precio_base = ?,
        precio_por_kg = ?,
        precio_por_m3 = ?,
        recargo_fragil = ?,
        recargo_especial = ?,
        precio_por_km = ?,
        descripcion = ?
      WHERE id_tarifa = ?`,
      [
        nombre,
        precio_base || 0,
        precio_por_kg || 0,
        precio_por_m3 || 0,
        recargo_fragil || 0,
        recargo_especial || 0,
        precio_por_km || 0,
        descripcion || null,
        id
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ success:false, message:"Tarifa no encontrada", data:null, errors:["No existe"] });

    const [rows] = await pool.query('SELECT * FROM tarifa WHERE id_tarifa = ?', [id]);

    return res.json({ success:true, message:"Tarifa actualizada", data:rows[0], errors:[] });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success:false, message:"Error en el servidor", data:null, errors:[error.message] });
  }
};

// Eliminar tarifa
export const deleteTarifa = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tarifa WHERE id_tarifa = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success:false, message:"Tarifa no encontrada", data:null, errors:["No existe"] });

    return res.json({ success:true, message:"Tarifa eliminada", data:{id:Number(id)}, errors:[] });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success:false, message:"Error en el servidor", data:null, errors:[error.message] });
  }
};
