// controllers/ruta_empresa/ruta_empresa_controller.js
import { pool } from '../../db.js';

// Obtener todas las rutas activas
export const getAllRutas = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ruta_empresa WHERE estado = 1');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener rutas' });
    }
};

// Obtener una ruta por id (solo activas)
export const getRutaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM ruta_empresa WHERE id_ruta = ? AND estado = 1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Ruta no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener ruta' });
    }
};

// Crear nueva ruta
export const createRuta = async (req, res) => {
    try {
        const { origen, destino, distancia_km } = req.body;
        const [result] = await pool.query(
            'INSERT INTO ruta_empresa (origen, destino, distancia_km) VALUES (?, ?, ?)',
            [origen, destino, distancia_km]
        );
        res.status(201).json({ id_ruta: result.insertId, origen, destino, distancia_km, estado: 1 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear ruta' });
    }
};

// Actualizar ruta
export const updateRuta = async (req, res) => {
    try {
        const { id } = req.params;
        const { origen, destino, distancia_km } = req.body;

        const [result] = await pool.query(
            'UPDATE ruta_empresa SET origen = ?, destino = ?, distancia_km = ? WHERE id_ruta = ? AND estado = 1',
            [origen, destino, distancia_km, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ruta no encontrada o inactiva' });
        }

        res.json({ id_ruta: id, origen, destino, distancia_km });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar ruta' });
    }
};

// "Eliminar" ruta (solo cambia estado a 0)
export const deleteRuta = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'UPDATE ruta_empresa SET estado = 0 WHERE id_ruta = ? AND estado = 1',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ruta no encontrada o ya eliminada' });
        }

        res.json({ message: 'Ruta eliminada (estado 0)' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar ruta' });
    }
};
