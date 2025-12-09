import { Router } from 'express';
import {
  createTipoProducto,
  listTipoProductos,
  getTipoProducto,
  updateTipoProducto,
  deleteTipoProducto
} from '../../controllers/tipo_producto/tipo_producto_controller.js';

const router = Router();

router.post('/', createTipoProducto);
router.get('/', listTipoProductos);
router.get('/:id', getTipoProducto);
router.put('/:id', updateTipoProducto);
router.delete('/:id', deleteTipoProducto);

export default router;
