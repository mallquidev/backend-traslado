// routes/tipo_usuario/tipo_usuario_routes.js
import { Router } from 'express';
import {
  createTipoUsuario,
  listTipoUsuarios,
  getTipoUsuario,
  updateTipoUsuario,
  deleteTipoUsuario
} from '../../controllers/tipo_usuarios/tipo_usuario_controller.js';

const router = Router();

// Rutas REST
router.post('/', createTipoUsuario);        // crear
router.get('/', listTipoUsuarios);          // listar
router.get('/:id', getTipoUsuario);         // obtener por id
router.put('/:id', updateTipoUsuario);      // actualizar
router.delete('/:id', deleteTipoUsuario);   // eliminar

export default router;
