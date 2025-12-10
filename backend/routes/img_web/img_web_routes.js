import { Router } from "express";
import {
  crearImagenWeb,
  actualizarImagenWeb,
  obtenerImagenesWeb,
  obtenerImagenWebPorId
} from "../../controllers/img_web/img_web_controller.js";

import upload from "../../middlewares/upload.js";

const router = Router();

router.post("/subir", upload.single("file"), crearImagenWeb);
router.put("/actualizar/:id", upload.single("file"), actualizarImagenWeb);
router.get("/", obtenerImagenesWeb);
router.get("/:id", obtenerImagenWebPorId);

export default router;
