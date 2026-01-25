import { Router } from "express";
import { testController } from "../../controllers/test/test_controller.js";
const router = Router();

// Ruta GET /hola
router.get("/", testController);

export default router;
