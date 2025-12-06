// controllers/tipo_usuario/tipo_usuario_controller.js
import { pool } from '../../db.js';

export const createTipoUsuario = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios",
        data: null,
        errors: ["El campo 'nombre' es requerido"]
      });
    }

    const [result] = await pool.query(
      'INSERT INTO tipo_usuario (nombre) VALUES (?)',
      [nombre]
    );

    const id = result.insertId;
    const [rows] = await pool.query('SELECT * FROM tipo_usuario WHERE id_tipo_usuario = ?', [id]);

    return res.status(201).json({
      success: true,
      message: "Tipo de usuario creado correctamente",
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

export const listTipoUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tipo_usuario ORDER BY id_tipo_usuario DESC');
    return res.json({
      success: true,
      message: "Lista de tipos de usuario",
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

export const getTipoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tipo_usuario WHERE id_tipo_usuario = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tipo de usuario no encontrado",
        data: null,
        errors: ["No existe un tipo de usuario con ese id"]
      });
    }

    return res.json({
      success: true,
      message: "Tipo de usuario obtenido",
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

export const updateTipoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios",
        data: null,
        errors: ["El campo 'nombre' es requerido"]
      });
    }

    const [result] = await pool.query(
      'UPDATE tipo_usuario SET nombre = ? WHERE id_tipo_usuario = ?',
      [nombre, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Tipo de usuario no encontrado",
        data: null,
        errors: ["No existe un tipo de usuario con ese id"]
      });
    }

    const [rows] = await pool.query('SELECT * FROM tipo_usuario WHERE id_tipo_usuario = ?', [id]);

    return res.json({
      success: true,
      message: "Tipo de usuario actualizado",
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

export const deleteTipoUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Aquí hacemos borrado físico. Si prefieres borrado lógico,
    // cambia la lógica para actualizar un campo 'activo' o 'estado'.
    const [result] = await pool.query('DELETE FROM tipo_usuario WHERE id_tipo_usuario = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Tipo de usuario no encontrado",
        data: null,
        errors: ["No existe un tipo de usuario con ese id"]
      });
    }

    return res.json({
      success: true,
      message: "Tipo de usuario eliminado",
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
