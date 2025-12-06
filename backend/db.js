import {createPool} from 'mysql2/promise'
import {HOST, PORTDB, USER, PASSWORD, DATABASE} from './config.js'

const pool = createPool({
    host: HOST,
    port: PORTDB,
    database: DATABASE,
    user: USER,
    password: PASSWORD
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