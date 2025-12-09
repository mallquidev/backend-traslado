import { pool } from "../../db.js";
import bcrypt from "bcryptjs";

export const getUsuarios = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.id_usuario,
                u.email,
                u.id_tipo_usuario,
                tu.nombre AS tipo_usuario,
                u.estado,
                u.nombres,
                u.apellidos,
                u.dni,
                u.celular,
                u.ciudad,
                u.direccion
            FROM usuario u
            LEFT JOIN tipo_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
        `);

        return res.json({
            success: true,
            message: "Lista de usuarios obtenida",
            data: rows,
            errors: []
        });

    } catch (error) {
        return res.status(500).json({
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
                u.nombres,
                u.apellidos,
                u.dni,
                u.celular,
                u.ciudad,
                u.direccion
            FROM usuario u
            LEFT JOIN tipo_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
            WHERE u.id_usuario = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
                data: null,
                errors: ["No existe un usuario con ese ID"]
            });
        }

        return res.json({
            success: true,
            message: "Usuario encontrado",
            data: rows[0],
            errors: []
        });

    } catch (error) {
        return res.status(500).json({
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
        const {
            id_tipo_usuario,
            email,
            nombres,
            apellidos,
            dni,
            celular,
            ciudad,
            direccion,
            estado
        } = req.body;

        // Verificar si existe
        const [existsUpdate] = await pool.query(
            "SELECT id_usuario FROM usuario WHERE id_usuario = ?",
            [id]
        );

        if (existsUpdate.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
                data: null,
                errors: ["No existe un usuario con ese ID"]
            });
        }

        // Verificar email duplicado
        if (email) {
            const [emailCheck] = await pool.query(
                "SELECT id_usuario FROM usuario WHERE email = ? AND id_usuario <> ?",
                [email, id]
            );

            if (emailCheck.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Este correo ya está en uso",
                    data: null,
                    errors: ["email ya registrado por otro usuario"]
                });
            }
        }

        // Actualizar
        await pool.query(`
            UPDATE usuario SET
                id_tipo_usuario = COALESCE(?, id_tipo_usuario),
                email = COALESCE(?, email),
                nombres = COALESCE(?, nombres),
                apellidos = COALESCE(?, apellidos),
                dni = COALESCE(?, dni),
                celular = COALESCE(?, celular),
                ciudad = COALESCE(?, ciudad),
                direccion = COALESCE(?, direccion),
                estado = COALESCE(?, estado)
            WHERE id_usuario = ?
        `, [
            id_tipo_usuario,
            email,
            nombres,
            apellidos,
            dni,
            celular,
            ciudad,
            direccion,
            estado,
            id
        ]);

        return res.json({
            success: true,
            message: "Usuario actualizado correctamente",
            data: { id },
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

        const [exists] = await pool.query(
            "SELECT id_usuario FROM usuario WHERE id_usuario = ?",
            [id]
        );

        if (exists.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
                data: null,
                errors: ["No existe un usuario con ese ID"]
            });
        }

        await pool.query(
            "DELETE FROM usuario WHERE id_usuario = ?",
            [id]
        );

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

export const registrarUsuarioCompleto = async (req, res) => {
    try {
        const {
            id_tipo_usuario,
            email,
            password,
            nombres,
            apellidos,
            dni,
            celular,
            ciudad,
            direccion
        } = req.body;

        // Validación de campos mínimos requeridos
        if (!email || !password || typeof id_tipo_usuario === "undefined") {
            return res.status(400).json({
                success: false,
                message: "Faltan datos obligatorios",
                data: null,
                errors: ["email, password e id_tipo_usuario son requeridos"]
            });
        }

        // Verificar si el email ya existe
        const [existsEmail] = await pool.query(
            "SELECT id_usuario FROM usuario WHERE email = ?",
            [email]
        );

        if (existsEmail.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Este correo ya está en uso",
                data: null,
                errors: ["email ya registrado"]
            });
        }

        // Verificar si el DNI ya existe (si fue enviado)
        if (dni) {
            const [existsDni] = await pool.query(
                "SELECT id_usuario FROM usuario WHERE dni = ?",
                [dni]
            );

            if (existsDni.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Este DNI ya está registrado",
                    data: null,
                    errors: ["dni ya existe en la base de datos"]
                });
            }
        }

        // Encriptar contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Registrar usuario
        const [result] = await pool.query(
            `INSERT INTO usuario 
            (id_tipo_usuario, email, password, nombres, apellidos, dni, celular, ciudad, direccion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_tipo_usuario,
                email,
                passwordHash,
                nombres || null,
                apellidos || null,
                dni || null,
                celular || null,
                ciudad || null,
                direccion || null
            ]
        );

        const newUserId = result.insertId;

        return res.status(201).json({
            success: true,
            message: "Usuario registrado exitosamente",
            data: {
                usuario: {
                    id: newUserId,
                    email,
                    id_tipo_usuario
                }
            },
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
