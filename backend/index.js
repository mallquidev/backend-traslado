import app from './app.js'
import {PORT} from './config.js'
import {checkConnect} from './db.js'

app.listen(PORT)
checkConnect()

console.log(`SERVER IS RUNNING ON PORT ${PORT}`)