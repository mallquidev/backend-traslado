import {createPool} from 'mysql2/promise'
import {DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME} from './config.js'

const pool = createPool({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD
})

async function checkConnect(){
    try {
        const conn = await pool.getConnection()
        await conn.query('SELECT 1')
        conn.release()
        console.log('DATABASE IS RUNNING')
    } catch (error) {
        console.error('Error en la BD!!!!!', error.message);
        console.error(error)
    }
}

export {pool, checkConnect}