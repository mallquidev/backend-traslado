import { Router } from 'express'
import { registerMassiveTraslado, getEstadisticasEstados, filtrarTraslados, actualizarEstadoTraslado, registerMassiveTrasladoWithKm } from '../../controllers/traslado/traslado_controller.js'

const router = Router()

router.post('/register-massive', registerMassiveTraslado)
router.post('/register-massive-km', registerMassiveTrasladoWithKm)
router.get("/estadisticas-estados", getEstadisticasEstados);
router.get('/filtrar', filtrarTraslados);
router.put('/actualizar-estado/:id', actualizarEstadoTraslado);



export default router
