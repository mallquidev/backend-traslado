import { Router } from "express";
import {
    getUsuarios,
    getUsuarioById,
    updateUsuario,
    deleteUsuario,
    registrarUsuarioCompleto
} from "../../controllers/usuario/usuario_controller.js";

const router = Router();

// Obtener todos los usuarios
router.get("/", getUsuarios);

// Obtener usuario por ID
router.get("/:id", getUsuarioById);

// Registrar usuario (sin token porque es dashboard)
router.post("/", registrarUsuarioCompleto);

// Actualizar usuario
router.put("/:id", updateUsuario);

// Eliminar usuario
router.delete("/:id", deleteUsuario);

export default router;
