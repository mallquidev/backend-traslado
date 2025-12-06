import { Router } from "express";
import {
    getProductosCliente,
    getProductoClienteById,
    createProductoCliente,
    updateProductoCliente,
    deleteProductoCliente
} from "../../controllers/producto_cliente/producto_cliente_controller.js";

const router = Router();

// GET
router.get("/", getProductosCliente);
router.get("/:id", getProductoClienteById);

// POST
router.post("/", createProductoCliente);

// PUT
router.put("/:id", updateProductoCliente);

// DELETE
router.delete("/:id", deleteProductoCliente);

export default router;
