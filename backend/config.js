import { config } from 'dotenv'
import path from 'path'

// Esto fuerza a dotenv a leer el .env que está en la carpeta padre
config({ path: path.resolve('../.env') })

export const PORT = process.env.PORT || 4000

// DATABASE
export const DB_HOST = process.env.DB_HOST
export const DB_PORT = process.env.DB_PORT
export const DB_USER = process.env.DB_USER
export const DB_PASSWORD = process.env.DB_PASSWORD
export const DB_NAME = process.env.DB_NAME
export const JWT_KEY = process.env.JWT_KEY