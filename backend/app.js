import express from 'express'
import authRoutes from './routes/auth/auth_routes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import tipoUsuarioRoutes from './routes/tipo_usuario/tipo_usuario_routes.js'
import usuarioRoutes from './routes/usuario/usuario_routes.js';
import estadoRoutes from './routes/estado/estado_routes.js';
import trasladoRoutes from "./routes/traslado/traslado_routes.js";
import productoClienteRoutes from "./routes/producto_cliente/producto_cliente_routes.js";
import imgProductoRoutes from "./routes/img_producto/img_producto_routes.js";

const app = express()
app.use(cors())
app.use(express.json())
app.use(cookieParser())


app.use('/api',authRoutes)
app.use('/api/tipo_usuario', tipoUsuarioRoutes)
app.use('/api/usuario', usuarioRoutes);
app.use('/api/estado', estadoRoutes);
app.use("/api/traslado", trasladoRoutes);
app.use("/api/producto_cliente", productoClienteRoutes);
app.use("/api/img_producto", imgProductoRoutes);

export default app;