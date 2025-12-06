import { Router } from "express";
import {
    getUsuarios,
    getUsuarioById,
    updateUsuario,
    deleteUsuario,
    registrarUsuarioCompleto
} from "../../controllers/usuario/usuario_controller.js";

const router = Router();

router.get("/", getUsuarios);
router.get("/:id", getUsuarioById);
router.put("/:id", updateUsuario);
router.delete("/:id", deleteUsuario);
router.post("/registrar", registrarUsuarioCompleto);

export default router;
