import { Router } from 'express'
import { registerMassiveTraslado } from '../../controllers/traslado/traslado_controller.js'

const router = Router()

router.post('/register-massive', registerMassiveTraslado)

export default router
