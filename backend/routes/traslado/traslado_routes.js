import { Router } from "express";
import {
    getTraslados,
    getTrasladoById,
    createTraslado,
    updateTraslado,
    deleteTraslado
} from "../../controllers/traslado/traslado_controller.js";

const router = Router();

// GET
router.get("/", getTraslados);
router.get("/:id", getTrasladoById);

// POST
router.post("/", createTraslado);

// PUT
router.put("/:id", updateTraslado);

// DELETE
router.delete("/:id", deleteTraslado);

export default router;
