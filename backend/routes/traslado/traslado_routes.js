import { Router } from 'express'
import { registerMassiveTraslado, getEstadisticasEstados, filtrarTraslados, actualizarEstadoTraslado } from '../../controllers/traslado/traslado_controller.js'

const router = Router()

router.post('/register-massive', registerMassiveTraslado)
router.get("/estadisticas-estados", getEstadisticasEstados);
router.get('/filtrar', filtrarTraslados);
router.put('/actualizar-estado/:id', actualizarEstadoTraslado);



export default router
