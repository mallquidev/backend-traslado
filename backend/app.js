import express from 'express'
import authRoutes from './routes/auth/auth_routes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import tipoUsuarioRoutes from './routes/tipo_usuario/tipo_usuario_routes.js'
import usuarioRoutes from './routes/usuario/usuario_routes.js';
import estadoRoutes from './routes/estado/estado_routes.js';
import trasladoRoutes from './routes/traslado/traslado_routes.js';
import imgProductoRoutes from "./routes/img_producto/img_producto_routes.js";

import tipoProductoRoutes from './routes/tipo_producto/tipo_producto_routes.js';
import tarifaRoutes from './routes/tarifa/tarifa_routes.js';

import productoClienteRoutes from './routes/producto_cliente/producto_cliente_routes.js';

import imgWebRoutes from "./routes/img_web/img_web_routes.js";

import swaggerUI from "swagger-ui-express";
import swaggerDocumentation from "./swagger.json" with {type:'json'};
import test from "./routes/test/test_routes.js";

const app = express()
app.set('trust proxy', true)
app.use(cors())
app.use(express.json())
app.use(cookieParser())


app.use('/api',authRoutes)
app.use('/api/tipo_usuario', tipoUsuarioRoutes)
app.use('/api/usuario', usuarioRoutes);
app.use('/api/estado', estadoRoutes);
app.use('/api/traslado', trasladoRoutes);
app.use("/api/img_producto", imgProductoRoutes);

app.use('/api/tipo_producto', tipoProductoRoutes);
app.use('/api/tarifa', tarifaRoutes);

app.use('/api/producto_cliente', productoClienteRoutes);

app.use("/api/img_web", imgWebRoutes);

app.use('/api/doc', swaggerUI.serve, swaggerUI.setup(swaggerDocumentation));
app.use('/api/hola', test)

export default app;