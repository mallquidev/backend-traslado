import { Router } from 'express';
import {
  createTarifa,
  listTarifas,
  getTarifa,
  updateTarifa,
  deleteTarifa
} from '../../controllers/tarifa/tarifa_controller.js';

const router = Router();

router.post('/', createTarifa);
router.get('/', listTarifas);
router.get('/:id', getTarifa);
router.put('/:id', updateTarifa);
router.delete('/:id', deleteTarifa);

export default router;
