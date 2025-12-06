// controllers/estado/estado_controller.js
import { pool } from "../../db.js";

// 🟢 Obtener todos los estados
export const getEstados = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM estado");

        return res.json({
            success: true,
            message: "Estados obtenidos correctamente",
            data: rows
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener estados",
            data: null,
            errors: [error.message]
        });
    }
};

// 🟢 Obtener estado por ID
export const getEstadoById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(
            "SELECT * FROM estado WHERE id_estado = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Estado no encontrado",
                data: null
            });
        }

        return res.json({
            success: true,
            message: "Estado obtenido correctamente",
            data: rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener estado",
            data: null,
            errors: [error.message]
        });
    }
};

// 🟢 Crear un estado
export const createEstado = async (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({
            success: false,
            message: "El campo nombre es obligatorio",
            data: null
        });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO estado (nombre) VALUES (?)",
            [nombre]
        );

        return res.json({
            success: true,
            message: "Estado creado correctamente",
            data: { id_estado: result.insertId, nombre }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al crear estado",
            data: null,
            errors: [error.message]
        });
    }
};

// 🟢 Actualizar estado
export const updateEstado = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    try {
        const [result] = await pool.query(
            "UPDATE estado SET nombre = ? WHERE id_estado = ?",
            [nombre, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Estado no encontrado",
                data: null
            });
        }

        return res.json({
            success: true,
            message: "Estado actualizado correctamente",
            data: { id_estado: id, nombre }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al actualizar estado",
            data: null,
            errors: [error.message]
        });
    }
};

// 🟢 Eliminar estado
export const deleteEstado = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            "DELETE FROM estado WHERE id_estado = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Estado no encontrado",
                data: null
            });
        }

        return res.json({
            success: true,
            message: "Estado eliminado correctamente",
            data: null
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al eliminar estado",
            data: null,
            errors: [error.message]
        });
    }
};
