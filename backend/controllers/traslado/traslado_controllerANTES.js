// controllers/traslado/traslado_controller.js
import { pool } from "../../db.js";

// Crear traslado (acepta fecha_registro enviada por el front)
export const createTraslado = async (req, res) => {
  try {
    const {
      id_usuario,
      id_trabajador,
      origen,
      destino,
      fecha_registro,
      fecha_programada
    } = req.body;

    // Validaciones
    let errors = [];
    if (!id_usuario) errors.push("El campo 'id_usuario' es obligatorio");
    if (!id_trabajador) errors.push("El campo 'id_trabajador' es obligatorio");
    if (!origen) errors.push("El campo 'origen' es obligatorio");
    if (!destino) errors.push("El campo 'destino' es obligatorio");
    if (!fecha_programada) errors.push("El campo 'fecha_programada' es obligatorio");

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios",
        data: null,
        errors
      });
    }

    // Estado inicial (Pendiente)
    const id_estado = 1;

    const fechaRegistroValue = fecha_registro ? fecha_registro : null;

    let result;
    if (fechaRegistroValue) {
      [result] = await pool.query(
        `INSERT INTO traslado (
          id_usuario,
          id_trabajador,
          origen,
          destino,
          fecha_registro,
          fecha_programada,
          precio_total,
          id_estado
        ) VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
        [id_usuario, id_trabajador, origen, destino, fechaRegistroValue, fecha_programada, id_estado]
      );
    } else {
      // Usar NOW() si no viene fecha_registro
      [result] = await pool.query(
        `INSERT INTO traslado (
          id_usuario,
          id_trabajador,
          origen,
          destino,
          fecha_registro,
          fecha_programada,
          precio_total,
          id_estado
        ) VALUES (?, ?, ?, ?, NOW(), ?, 0, ?)`,
        [id_usuario, id_trabajador, origen, destino, fecha_programada, id_estado]
      );
    }

    const id_traslado = result.insertId;

    const [rows] = await pool.query(
    `SELECT 
         t.*,
         u.nombres AS cliente_nombres,
         u.apellidos AS cliente_apellidos,
         e.nombre AS estado_nombre
       FROM traslado t
       LEFT JOIN usuario u ON u.id_usuario = t.id_usuario
       LEFT JOIN estado e ON t.id_estado = e.id_estado
       WHERE t.id_traslado = ?`,
      [id_traslado]
    );


    return res.status(201).json({
      success: true,
      message: "Traslado creado correctamente",
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

// Listar todos los traslados
export const listTraslados = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.*,
        u.nombres AS cliente,
        u.apellidos AS cliente_apellidos,
        e.nombre AS estado_nombre
      FROM traslado t
      LEFT JOIN usuario u ON t.id_usuario = u.id_usuario
      LEFT JOIN estado e ON t.id_estado = e.id_estado
      ORDER BY t.id_traslado DESC
    `);

    return res.json({
      success: true,
      message: "Lista de traslados",
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

// Obtener traslado por id
export const getTraslado = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT t.*, u.nombres AS cliente_nombres, u.apellidos AS cliente_apellidos, e.nombre AS estado_nombre
       FROM traslado t
       LEFT JOIN usuario u ON t.id_usuario = u.id_usuario
       LEFT JOIN estado e ON t.id_estado = e.id_estado
       WHERE t.id_traslado = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Traslado no encontrado",
        data: null,
        errors: ["No existe un traslado con ese ID"]
      });
    }

    return res.json({
      success: true,
      message: "Traslado obtenido",
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

// Actualizar traslado (incluye fecha_registro por si es necesario)
export const updateTraslado = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_usuario,
      id_trabajador,
      origen,
      destino,
      fecha_registro,
      fecha_programada,
      id_estado
    } = req.body;

    const [result] = await pool.query(
      `UPDATE traslado SET
        id_usuario = ?,
        id_trabajador = ?,
        origen = ?,
        destino = ?,
        fecha_registro = ?,
        fecha_programada = ?,
        id_estado = ?
      WHERE id_traslado = ?`,
      [
        id_usuario,
        id_trabajador,
        origen,
        destino,
        fecha_registro || null,
        fecha_programada,
        id_estado,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Traslado no encontrado",
        data: null,
        errors: ["No existe un traslado con ese ID"]
      });
    }

    const [updated] = await pool.query(
      `SELECT * FROM traslado WHERE id_traslado = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: "Traslado actualizado",
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


// Eliminar traslado
export const deleteTraslado = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM traslado WHERE id_traslado = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Traslado no encontrado",
        data: null,
        errors: ["No existe un traslado con ese ID"]
      });
    }

    return res.json({
      success: true,
      message: "Traslado eliminado",
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
