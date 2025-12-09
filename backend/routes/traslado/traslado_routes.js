// routes/traslado/traslado_routes.js
import { Router } from "express";
import {
  createTraslado,
  listTraslados,
  getTraslado,
  updateTraslado,
  deleteTraslado
} from "../../controllers/traslado/traslado_controller.js";

const router = Router();

router.post("/", createTraslado);
router.get("/", listTraslados);
router.get("/:id", getTraslado);
router.put("/:id", updateTraslado);
router.delete("/:id", deleteTraslado);

export default router;
