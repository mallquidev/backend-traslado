import { pool } from "../../db.js";

export const getUsuarios = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.id_usuario,
                u.email,
                u.id_tipo_usuario,
                tu.nombre AS tipo_usuario,
                u.estado,
                ud.nombres,
                ud.apellidos,
                ud.dni,
                ud.celular,
                ud.direccion
            FROM usuario u
            LEFT JOIN usuario_detalles ud 
                ON u.id_usuario = ud.id_usuario
            LEFT JOIN tipo_usuario tu 
                ON u.id_tipo_usuario = tu.id_tipo_usuario
        `);

        res.json({
            success: true,
            message: "Usuarios obtenidos correctamente",
            data: rows
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener usuarios",
            data: null,
            errors: [error.message]
        });
    }
};



export const getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(`
            SELECT 
                u.id_usuario,
                u.email,
                u.id_tipo_usuario,
                tu.nombre AS tipo_usuario,
                u.estado,
                ud.nombres,
                ud.apellidos,
                ud.dni,
                ud.celular,
                ud.direccion
            FROM usuario u
            LEFT JOIN usuario_detalles ud 
                ON u.id_usuario = ud.id_usuario
            LEFT JOIN tipo_usuario tu 
                ON u.id_tipo_usuario = tu.id_tipo_usuario
            WHERE u.id_usuario = ?
        `, [id]);

        if (rows.length === 0) {
            return res.json({
                success: false,
                message: "Usuario no encontrado",
                data: null,
                errors: []
            });
        }

        res.json({
            success: true,
            message: "Usuario obtenido correctamente",
            data: rows[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener usuario",
            data: null,
            errors: [error.message]
        });
    }
};



export const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, tipo_usuario_id } = req.body;

        const [result] = await pool.query(
            `UPDATE usuario SET email = ?, tipo_usuario_id = ? WHERE id_usuario = ?`,
            [email, tipo_usuario_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
                data: null,
                errors: ["ID no existe"]
            });
        }

        return res.json({
            success: true,
            message: "Usuario actualizado correctamente",
            data: { id, email, tipo_usuario_id },
            errors: []
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al actualizar usuario",
            data: null,
            errors: [error.message]
        });
    }
};


export const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            `DELETE FROM usuario WHERE id_usuario = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
                data: null,
                errors: ["ID no existe"]
            });
        }

        return res.json({
            success: true,
            message: "Usuario eliminado correctamente",
            data: { id },
            errors: []
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al eliminar usuario",
            data: null,
            errors: [error.message]
        });
    }
};


// Registrar usuario con detalles
export const registrarUsuarioCompleto = async (req, res) => {
    const { email, password, nombres, apellidos, dni, celular, direccion } = req.body;

    try {
        // Validar campos obligatorios
        if (!email || !password || !nombres || !apellidos || !dni) {
            return res.status(400).json({
                success: false,
                message: "Faltan campos obligatorios",
                data: null,
                errors: ["email, password, nombres, apellidos y dni son requeridos"]
            });
        }

        // Verificar si el email ya existe
        const [exists] = await pool.query(
            "SELECT id_usuario FROM usuario WHERE email = ?",
            [email]
        );

        if (exists.length > 0) {
            return res.status(409).json({
                success: false,
                message: "El correo ya está registrado",
                data: null,
                errors: ["email duplicado"]
            });
        }

        // Crear usuario con tipo_usuario = 2 (cliente)
        const [userResult] = await pool.query(
            `INSERT INTO usuario (id_tipo_usuario, email, password) VALUES (2, ?, ?)`,
            [email, password]
        );

        const userId = userResult.insertId;

        // Crear detalles
        await pool.query(
            `INSERT INTO usuario_detalles (id_usuario, nombres, apellidos, dni, celular, direccion)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, nombres, apellidos, dni, celular || null, direccion || null]
        );

        return res.json({
            success: true,
            message: "Usuario registrado correctamente",
            data: {
                id_usuario: userId,
                email,
                nombres,
                apellidos,
                dni,
                celular,
                direccion,
                tipo_usuario: 2
            },
            errors: []
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al registrar usuario completo",
            data: null,
            errors: [error.message]
        });
    }
};
