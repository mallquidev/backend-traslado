import { Router } from 'express';
import {
  createProductoCliente,
  listProductoClientes,
  getProductoCliente,
  updateProductoCliente,
  deleteProductoCliente
} from '../../controllers/producto_cliente/producto_cliente_controller.js';

const router = Router();

// Registrar producto
router.post('/', createProductoCliente);
router.get('/', listProductoClientes);         // Listar todos
router.get('/:id', getProductoCliente);        // Obtener por id
router.put('/:id', updateProductoCliente);     // Actualizar
router.delete('/:id', deleteProductoCliente);  // Eliminar

export default router;
