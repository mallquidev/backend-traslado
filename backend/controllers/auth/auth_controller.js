import {pool} from '../../db.js'
import bcrypt from 'bcryptjs'
import {createAccessToken} from '../../libs/jwt.js'
import jwt from 'jsonwebtoken'
import {JWT_KEY} from '../../config.js'

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos obligatorios",
                data: null,
                errors: ["email y password son requeridos"]
            });
        }

        // Verificar si el correo ya existe
        const [existingUser] = await pool.query(
            "SELECT id_usuario FROM usuario WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: "El correo ya está en uso",
                data: null,
                errors: ["email ya registrado"]
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await pool.query(`
            INSERT INTO usuario (email, password)
            VALUES (?, ?)
        `, [email, passwordHash]);

        const token = await createAccessToken({ id: result.insertId });

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true
        });

        return res.json({
            success: true,
            message: "Usuario registrado correctamente",
            data: {
                token,
                usuario: {
                    id: result.insertId,
                    email
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


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos obligatorios",
                data: null,
                errors: ["email y password son requeridos"]
            });
        }

        const [rows] = await pool.query(
            "SELECT * FROM usuario WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
                data: null,
                errors: ["No existe un usuario con ese email"]
            });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Credenciales incorrectas",
                data: null,
                errors: ["Contraseña inválida"]
            });
        }

        const token = await createAccessToken({ id: user.id_usuario });

        res.cookie("token", token, {
            sameSite: "none",
            secure: true
        });

        return res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            data: {
                token,
                usuario: {
                    id: user.id_usuario,
                    email: user.email
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


export const logout = (req, res) =>{
    try {
        res.cookie('token', '', {
            expire: new Date(0)
        })
        res.sendStatus(200)
    } catch (error) {
        res.status(500).json({message: error.message})
        console.error(error)
    }
}

export const profile = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id_usuario, email FROM usuario WHERE id_usuario = ?",
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
                data: null,
                errors: ["El ID del usuario no existe"]
            });
        }

        return res.json({
            success: true,
            message: "Perfil obtenido correctamente PROFILE",
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



export const verifyToken = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        jwt.verify(token, JWT_KEY, async (err, user) => {
            if (err) return res.status(401).json({ message: "Unauthorized" });

            const [rows] = await pool.query(
                'SELECT id_usuario, email FROM usuario WHERE id_usuario = ?',
                [user.id]
            );

            if (rows.length === 0)
                return res.status(401).json({ message: 'Unauthorized' });

            res.json(rows[0]);
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

