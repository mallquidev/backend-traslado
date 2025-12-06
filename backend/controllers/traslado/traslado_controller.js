// controllers/traslado/traslado_controller.js
import { pool } from "../../db.js";

// 🟢 Obtener todos los traslados
export const getTraslados = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                t.id_traslado,
                t.origen,
                t.destino,
                t.fecha_registro,
                t.fecha_programada,
                t.precio_total,
                e.nombre AS estado,
                
                u.id_usuario AS cliente_id,
                udc.nombres AS cliente_nombres,
                udc.apellidos AS cliente_apellidos,
                u.email AS cliente_email,
                
                tr.id_usuario AS trabajador_id,
                udt.nombres AS trabajador_nombres,
                udt.apellidos AS trabajador_apellidos

            FROM traslado t
            LEFT JOIN estado e ON t.id_estado = e.id_estado
            LEFT JOIN usuario u ON t.id_usuario = u.id_usuario
            LEFT JOIN usuario_detalles udc ON u.id_usuario = udc.id_usuario
            LEFT JOIN usuario tr ON t.id_trabajador = tr.id_usuario
            LEFT JOIN usuario_detalles udt ON tr.id_usuario = udt.id_usuario
            ORDER BY t.fecha_registro DESC
        `);

        return res.json({
            success: true,
            message: "Traslados obtenidos correctamente",
            data: rows
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener traslados",
            data: null,
            errors: [error.message]
        });
    }
};

// 🟢 Obtener traslado por ID
export const getTrasladoById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(`
            SELECT 
                t.*,
                e.nombre AS estado
            FROM traslado t
            LEFT JOIN estado e ON t.id_estado = e.id_estado
            WHERE t.id_traslado = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Traslado no encontrado",
                data: null
            });
        }

        return res.json({
            success: true,
            message: "Traslado encontrado correctamente",
            data: rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener traslado",
            data: null,
            errors: [error.message]
        });
    }
};

// 🟢 Crear traslado
export const createTraslado = async (req, res) => {
    const {
        id_usuario,
        id_trabajador,
        origen,
        destino,
        fecha_programada,
        precio_total,
        id_estado
    } = req.body;

    if (!id_usuario || !origen || !destino || !id_estado) {
        return res.status(400).json({
            success: false,
            message: "Los campos id_usuario, origen, destino e id_estado son obligatorios",
            data: null
        });
    }

    try {
        const [result] = await pool.query(`
            INSERT INTO traslado 
            (id_usuario, id_trabajador, origen, destino, fecha_programada, precio_total, id_estado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            id_usuario,
            id_trabajador || null,
            origen,
            destino,
            fecha_programada || null,
            precio_total || 0,
            id_estado
        ]);

        return res.json({
            success: true,
            message: "Traslado registrado correctamente",
            data: { id_traslado: result.insertId }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al registrar traslado",
            data: null,
            errors: [error.message]
        });
    }
};

// 🟢 Actualizar traslado
export const updateTraslado = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(`
            UPDATE traslado SET ? WHERE id_traslado = ?
        `, [req.body, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Traslado no encontrado",
                data: null
            });
        }

        return res.json({
            success: true,
            message: "Traslado actualizado correctamente",
            data: { id_traslado: id }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al actualizar traslado",
            data: null,
            errors: [error.message]
        });
    }
};

// 🟢 Eliminar traslado
export const deleteTraslado = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(`
            DELETE FROM traslado WHERE id_traslado = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Traslado no encontrado",
                data: null
            });
        }

        return res.json({
            success: true,
            message: "Traslado eliminado correctamente",
            data: null
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al eliminar traslado",
            data: null,
            errors: [error.message]
        });
    }
};
