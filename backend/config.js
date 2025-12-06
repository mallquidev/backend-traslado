import {config} from 'dotenv'

config()
export const PORT = process.env.PORT || 3000
//DATABASE
export const HOST = process.env.HOST
export const PORTDB = process.env.PORTDB
export const USER = process.env.USER
export const PASSWORD = process.env.PASSWORD
export const DATABASE = process.env.DATABASE
export const JWT_KEY = process.env.JWT_KEY