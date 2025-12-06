import { pool } from "../../db.js";
import cloudinary from "../../configs/cloudinary.js";

export const uploadImgProducto = async (req, res) => {
    const { id_producto } = req.body;

    if (!id_producto || !req.file) {
        return res.status(400).json({
            success: false,
            message: "id_producto e imagen son obligatorios",
            data: null
        });
    }

    try {
        const url_img = req.file.path;

        const [result] = await pool.query(`
            INSERT INTO img_producto (id_producto, url_img)
            VALUES (?, ?)
        `, [id_producto, url_img]);

        return res.json({
            success: true,
            message: "Imagen subida correctamente",
            data: {
                id_img: result.insertId,
                url_img
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al subir imagen",
            data: null,
            errors: [error.message]
        });
    }
};

export const getImgsByProducto = async (req, res) => {
    const { id_producto } = req.params;

    try {
        const [rows] = await pool.query(`
            SELECT * FROM img_producto WHERE id_producto = ?
        `, [id_producto]);

        return res.json({
            success: true,
            message: "Imágenes obtenidas",
            data: rows
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener imágenes",
            data: null,
            errors: [error.message]
        });
    }
};

export const deleteImgProducto = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(`
            SELECT * FROM img_producto WHERE id_img = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Imagen no encontrada",
                data: null
            });
        }

        const url = rows[0].url_img;

        const publicId = url.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`productos_traslado/${publicId}`);

        await pool.query(`
            DELETE FROM img_producto WHERE id_img = ?
        `, [id]);

        return res.json({
            success: true,
            message: "Imagen eliminada correctamente",
            data: null
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al eliminar imagen",
            data: null,
            errors: [error.message]
        });
    }
};
