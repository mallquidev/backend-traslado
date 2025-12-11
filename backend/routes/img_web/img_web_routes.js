import { Router } from "express";
import { 
  crearImagenWeb, 
  actualizarImagenWeb, 
  obtenerImagenesWeb, 
  obtenerImagenWebPorId 
} from "../../controllers/img_web/img_web_controller.js";

const router = Router();

// Crear nueva imagen
// POST http://localhost:3000/api/img_web/subir
router.post("/subir", crearImagenWeb);

// Actualizar imagen por ID
// PUT http://localhost:3000/api/img_web/actualizar/:id
router.put("/actualizar/:id", actualizarImagenWeb);

// Obtener todas las imágenes
// GET http://localhost:3000/api/img_web/
router.get("/", obtenerImagenesWeb);

// Obtener imagen por ID
// GET http://localhost:3000/api/img_web/:id
router.get("/:id", obtenerImagenWebPorId);

export default router;
