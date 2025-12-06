import { Router } from "express";
import { testController } from "../test/test_controller.js";

const router = Router();

// Ruta GET /hola
router.get("/hola", test_controller);

export default router;
