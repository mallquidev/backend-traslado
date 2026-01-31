// routes/ruta_empresa/ruta_empresa_routes.js
import { Router } from 'express';
import {
    getAllRutas,
    getRutaById,
    createRuta,
    updateRuta,
    deleteRuta
} from '../../controllers/ruta_empresa/ruta_empresa_controller.js';

const router = Router();

router.get('/', getAllRutas);
router.get('/:id', getRutaById);
router.post('/', createRuta);
router.put('/:id', updateRuta);
router.delete('/:id', deleteRuta);

export default router;
