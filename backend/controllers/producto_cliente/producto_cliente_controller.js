// controllers/producto_cliente/producto_cliente_controller.js
import { pool } from "../../db.js";

// 🟢 OBTENER TODOS LOS PRODUCTOS
export const getProductosCliente = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.*,
                t.origen,
                t.destino,
                t.fecha_registro,
                e.nombre AS estado
            FROM producto_cliente p
            LEFT JOIN traslado t ON p.id_traslado = t.id_traslado
            LEFT JOIN estado e ON t.id_estado = e.id_estado
            ORDER BY p.id_producto DESC
        `);

        return res.json({
            success: true,
            message: "Productos obtenidos correctamente",
            data: rows
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener productos",
            data: null,
            errors: [error.message]
        });
    }
};

// 🟢 OBTENER PRODUCTO POR ID
export const getProductoClienteById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(`
            SELECT 
                p.*,
                t.origen,
                t.destino,
                t.fecha_registro
            FROM producto_cliente p
            LEFT JOIN traslado t ON p.id_traslado = t.id_traslado
            WHERE p.id_producto = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado",
                data: null
            });
        }

        return res.json({
            success: true,
            message: "Producto encontrado",
            data: rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener producto",
            data: null,
            errors: [error.message]
        });
    }
};

// 🟢 CREAR PRODUCTO
export const createProductoCliente = async (req, res) => {
    const {
        id_traslado,
        nombre,
        descripcion,
        peso,
        alto,
        ancho,
        largo,
        cantidad
    } = req.body;

    if (!id_traslado || !nombre) {
        return res.status(400).json({
            success: false,
            message: "Los campos id_traslado y nombre son obligatorios",
            data: null
        });
    }

    try {
        const [result] = await pool.query(`
            INSERT INTO producto_cliente 
            (id_traslado, nombre, descripcion, peso, alto, ancho, largo, cantidad)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id_traslado,
            nombre,
            descripcion || null,
            peso || null,
            alto || null,
            ancho || null,
            largo || null,
            cantidad || 1
        ]);

        return res.json({
            success: true,
            message: "Producto registrado correctamente",
            data: { id_producto: result.insertId }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al registrar producto",
            data: null,
            errors: [error.message]
        });
    }
};

// 🟢 ACTUALIZAR PRODUCTO
export const updateProductoCliente = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(`
            UPDATE producto_cliente SET ? WHERE id_producto = ?
        `, [req.body, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado",
                data: null
            });
        }

        return res.json({
            success: true,
            message: "Producto actualizado correctamente",
            data: { id_producto: id }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al actualizar producto",
            data: null,
            errors: [error.message]
        });
    }
};

// 🟢 ELIMINAR PRODUCTO
export const deleteProductoCliente = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(`
            DELETE FROM producto_cliente WHERE id_producto = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado",
                data: null
            });
        }

        return res.json({
            success: true,
            message: "Producto eliminado correctamente",
            data: null
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al eliminar producto",
            data: null,
            errors: [error.message]
        });
    }
};
