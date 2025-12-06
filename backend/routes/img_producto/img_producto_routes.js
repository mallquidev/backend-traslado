import { Router } from "express";
import upload from "../../middlewares/upload.js";

import {
    uploadImgProducto,
    getImgsByProducto,
    deleteImgProducto
} from "../../controllers/img_producto/img_producto_controller.js";

const router = Router();

// SUBIR IMAGEN
router.post("/", upload.single("imagen"), uploadImgProducto);

// LISTAR POR PRODUCTO
router.get("/:id_producto", getImgsByProducto);

// ELIMINAR
router.delete("/:id", deleteImgProducto);

export default router;
