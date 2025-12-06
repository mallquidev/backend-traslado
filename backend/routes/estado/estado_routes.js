// routes/estado/estado_routes.js
import { Router } from "express";
import {
    getEstados,
    getEstadoById,
    createEstado,
    updateEstado,
    deleteEstado
} from "../../controllers/estado/estado_controller.js";

const router = Router();

// GET
router.get("/", getEstados);
router.get("/:id", getEstadoById);

// POST
router.post("/", createEstado);

// PUT
router.put("/:id", updateEstado);

// DELETE
router.delete("/:id", deleteEstado);

export default router;
