import {Router} from 'express'
import {authRequerid} from '../../middlewares/validateToken.js'
import {register, login, logout, profile} from '../../controllers/auth/auth_controller.js'

const router = Router()

router.post('/register', register)

router.post('/login', login)

router.post('/logout', logout)

router.get('/profile', authRequerid, profile)

export default router;