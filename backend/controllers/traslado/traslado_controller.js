import { pool } from '../../db.js'

export const registerMassiveTraslado = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const { origen, destino, fechaRegistro, estado, cliente, items } = req.body;

        if (!origen || !destino || !cliente || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos obligatorios",
                data: null,
                errors: ["origen, destino, cliente, estado y items son requeridos"]
            });
        }

        // 1️⃣ Formatear fecha
        const fechaRegistroFormatted = fechaRegistro
            ? new Date(fechaRegistro).toISOString().slice(0, 19).replace('T', ' ')
            : new Date().toISOString().slice(0, 19).replace('T', ' ');

        // 2️⃣ Buscar estado
        if (!estado) {
            throw new Error("Debes enviar el estado del traslado.");
        }

        let [estadoRow] = await conn.query(
            "SELECT id_estado FROM estado WHERE nombre = ?",
            [estado]
        );

        let estadoId;

        if (estadoRow.length > 0) {
            // Estado existe
            estadoId = estadoRow[0].id_estado;
        } else {
            // Estado NO existe → crearlo
            const [newEstado] = await conn.query(
                "INSERT INTO estado (nombre) VALUES (?)",
                [estado]
            );
            estadoId = newEstado.insertId;
        }

        // 3️⃣ Buscar cliente por DNI o email
        const [existingUser] = await conn.query(
            "SELECT id_usuario, id_tipo_usuario FROM usuario WHERE dni = ? OR email = ?",
            [cliente.dni, cliente.email]
        );

        let clienteId;
        let tipoUsuarioFinal;

        if (existingUser.length > 0) {
            clienteId = existingUser[0].id_usuario;
            tipoUsuarioFinal = existingUser[0].id_tipo_usuario;
        } else {
            // Crear tipo_usuario CLIENTE si no existe
            let [tipoCliente] = await conn.query(
                "SELECT id_tipo_usuario FROM tipo_usuario WHERE nombre = 'cliente'"
            );
            let idClienteTipo;

            if (tipoCliente.length > 0) {
                idClienteTipo = tipoCliente[0].id_tipo_usuario;
            } else {
                const [newTipo] = await conn.query(
                    "INSERT INTO tipo_usuario (nombre) VALUES ('cliente')"
                );
                idClienteTipo = newTipo.insertId;
            }

            // Registrar nuevo cliente
            const [newUser] = await conn.query(
                `INSERT INTO usuario (
                    id_tipo_usuario, nombres, apellidos, dni, celular, ciudad, direccion, email
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    idClienteTipo,
                    cliente.nombres,
                    cliente.apellidos,
                    cliente.dni,
                    cliente.celular,
                    cliente.ciudad,
                    cliente.direccion,
                    cliente.email
                ]
            );

            clienteId = newUser.insertId;
            tipoUsuarioFinal = idClienteTipo;
        }

        // 4️⃣ Crear traslado con estado dinámico
        const [trasladoResult] = await conn.query(
            `INSERT INTO traslado (id_usuario, origen, destino, fecha_registro, id_estado)
             VALUES (?, ?, ?, ?, ?)`,
            [clienteId, origen, destino, fechaRegistroFormatted, estadoId]
        );

        const trasladoId = trasladoResult.insertId;

        let totalTraslado = 0;
        const productosRegistrados = [];

        // 5️⃣ Registrar items
        for (const item of items) {

            let [tipoProducto] = await conn.query(
                "SELECT id_tipo_producto FROM tipo_producto WHERE nombre = ?",
                [item.tipoProducto]
            );

            let tipoProductoId;

            if (tipoProducto.length > 0) {
                tipoProductoId = tipoProducto[0].id_tipo_producto;
            } else {
                const [newTipo] = await conn.query(
                    "INSERT INTO tipo_producto (nombre, descripcion) VALUES (?, ?)",
                    [item.tipoProducto, item.descripcion || ""]
                );
                tipoProductoId = newTipo.insertId;
            }

            // Tarifa
            const [tarifa] = await conn.query(
                "SELECT * FROM tarifa WHERE nombre = ?",
                [item.tarifa]
            );

            if (tarifa.length === 0) {
                throw new Error(`La tarifa '${item.tarifa}' no existe`);
            }

            const tarifaId = tarifa[0].id_tarifa;

            // Calcular precio
            const peso = Number(item.peso) || 0;
            const alto = Number(item.alto) || 0;
            const ancho = Number(item.ancho) || 0;
            const largo = Number(item.largo) || 0;

            const precioBase = Number(tarifa[0].precio_base) || 0;
            const precioPorKg = Number(tarifa[0].precio_por_kg) || 0;
            const precioPorM3 = Number(tarifa[0].precio_por_m3) || 0;

            let precioUnitario = precioBase +
                (precioPorKg * peso) +
                (precioPorM3 * (alto * ancho * largo / 1000000));

            precioUnitario = parseFloat(precioUnitario.toFixed(2));

            const [productoResult] = await conn.query(
                `INSERT INTO producto_cliente 
                (id_traslado, id_usuario, nombre, descripcion, peso, alto, ancho, largo, cantidad, id_tipo_producto, id_tarifa, precio_unitario)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    trasladoId, clienteId,
                    item.nombre, item.descripcion,
                    item.peso, item.alto, item.ancho, item.largo,
                    item.cantidad || 1,
                    tipoProductoId, tarifaId,
                    precioUnitario
                ]
            );

            const productoId = productoResult.insertId;

            if (item.imageUrls && item.imageUrls.length > 0) {
                for (const url of item.imageUrls) {
                    await conn.query(
                        "INSERT INTO img_producto (id_producto, url_img) VALUES (?, ?)",
                        [productoId, url]
                    );
                }
            }

            const subtotal = parseFloat((precioUnitario * (item.cantidad || 1)).toFixed(2));
            totalTraslado += subtotal;

            productosRegistrados.push({
                id_producto: productoId,
                nombre: item.nombre,
                tipoProducto: item.tipoProducto,
                tarifa: item.tarifa,
                precioUnitario,
                cantidad: item.cantidad || 1,
                subtotal,
                imageUrls: item.imageUrls || []
            });
        }

        // 6️⃣ Actualizar total
        await conn.query(
            "UPDATE traslado SET precio_total = ? WHERE id_traslado = ?",
            [parseFloat(totalTraslado.toFixed(2)), trasladoId]
        );

        await conn.commit();

        res.json({
            success: true,
            message: "Traslado registrado exitosamente",
            data: {
                id_traslado: trasladoId,
                estado: estado,
                cliente: {
                    id_usuario: clienteId,
                    tipo_usuario: tipoUsuarioFinal,
                    ...cliente
                },
                total: parseFloat(totalTraslado.toFixed(2)),
                productos: productosRegistrados
            },
            errors: []
        });

    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error registrando traslado",
            data: null,
            errors: [error.message]
        });
    } finally {
        conn.release();
    }
};

export const getEstadisticasEstados = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.id_estado,
                e.nombre AS estado,
                
                -- Cantidad de traslados
                COUNT(DISTINCT t.id_traslado) AS total_traslados,

                -- Cantidad de productos dentro de esos traslados
                COUNT(pc.id_producto) AS total_productos

            FROM estado e
            LEFT JOIN traslado t ON e.id_estado = t.id_estado
            LEFT JOIN producto_cliente pc ON t.id_traslado = pc.id_traslado
            GROUP BY e.id_estado, e.nombre
            ORDER BY e.id_estado;
        `);

        res.json({
            success: true,
            message: "Estadísticas obtenidas correctamente",
            data: rows,
            errors: []
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error obteniendo estadísticas",
            data: null,
            errors: [error.message]
        });
    }
};

// =========================================
// GET: Filtrar traslados por estado
// URL: /api/traslado/filtrar?estado=En Camino
// =========================================
export const filtrarTraslados = async (req, res) => {
    try {
        const { estado, dni, limit } = req.query;

        // 1. Traer traslados (YA con precio_total)
        let trasladoQuery = `
            SELECT 
                t.id_traslado,
                t.origen,
                t.destino,
                t.fecha_registro,
                t.precio_total,
                e.nombre AS estado,
                u.nombres AS cliente_nombres,
                u.apellidos AS cliente_apellidos,
                u.dni AS cliente_dni,
                u.celular AS cliente_celular,
                u.ciudad AS cliente_ciudad,
                u.direccion AS cliente_direccion,
                u.email AS cliente_email
            FROM traslado t
            INNER JOIN estado e ON t.id_estado = e.id_estado
            INNER JOIN usuario u ON t.id_usuario = u.id_usuario
        `;

        const conditions = [];
        const params = [];

        if (estado) {
            const estadosArray = estado.split(',').map(s => s.trim());
            conditions.push(`e.nombre IN (${estadosArray.map(() => '?').join(',')})`);
            params.push(...estadosArray);
        }

        if (dni) {
            conditions.push(`u.dni = ?`);
            params.push(dni);
        }

        if (conditions.length > 0) {
            trasladoQuery += ' WHERE ' + conditions.join(' AND ');
        }

        trasladoQuery += ' ORDER BY t.fecha_registro DESC';

        if (limit) {
            trasladoQuery += ' LIMIT ?';
            params.push(Number(limit));
        }

        const [traslados] = await pool.query(trasladoQuery, params);

        if (traslados.length === 0) {
            return res.json({
                success: true,
                message: "No se encontraron traslados",
                data: []
            });
        }

        // 2. Traer productos (LEFT JOINs)
        const trasladoIds = traslados.map(t => t.id_traslado);

        const [productos] = await pool.query(`
            SELECT 
                pc.id_producto,
                pc.id_traslado,
                pc.nombre,
                pc.descripcion,
                tp.nombre AS tipo_producto,
                ta.nombre AS tarifa,
                pc.peso,
                pc.alto,
                pc.ancho,
                pc.largo,
                pc.cantidad,
                pc.precio_unitario,
                (pc.cantidad * pc.precio_unitario) AS subtotal,
                img.url_img AS imagen_url
            FROM producto_cliente pc
            LEFT JOIN tipo_producto tp ON pc.id_tipo_producto = tp.id_tipo_producto
            LEFT JOIN tarifa ta ON pc.id_tarifa = ta.id_tarifa
            LEFT JOIN img_producto img ON img.id_producto = pc.id_producto
            WHERE pc.id_traslado IN (?)
        `, [trasladoIds]);

        // 3. Construir mapa base
        const trasladosMap = {};

        traslados.forEach(row => {
            trasladosMap[row.id_traslado] = {
                idTraslado: row.id_traslado,
                origen: row.origen,
                destino: row.destino,
                fechaRegistro: row.fecha_registro,
                estado: row.estado,
                cliente: {
                    nombres: row.cliente_nombres,
                    apellidos: row.cliente_apellidos,
                    dni: row.cliente_dni,
                    celular: row.cliente_celular,
                    ciudad: row.cliente_ciudad,
                    direccion: row.cliente_direccion,
                    email: row.cliente_email
                },
                items: [],
                cantidadTotalProductos: 0,
                totalCosto: Number(row.precio_total)
            };
        });

        // 4. Agregar productos
        productos.forEach(row => {
            const traslado = trasladosMap[row.id_traslado];
            if (!traslado || !row.id_producto) return;

            let item = traslado.items.find(it => it.id === row.id_producto);

            if (!item) {
                item = {
                    id: row.id_producto,
                    nombre: row.nombre,
                    descripcion: row.descripcion,
                    tipoProducto: row.tipo_producto,
                    tarifa: row.tarifa,
                    peso: row.peso,
                    alto: row.alto,
                    ancho: row.ancho,
                    largo: row.largo,
                    cantidad: row.cantidad,
                    precioUnitario: Number(row.precio_unitario),
                    subtotal: Number(row.subtotal),
                    imageUrls: []
                };

                traslado.items.push(item);
                traslado.cantidadTotalProductos += row.cantidad;
            }

            if (row.imagen_url) {
                item.imageUrls.push(row.imagen_url);
            }
        });

        return res.json({
            success: true,
            message: "Traslados obtenidos correctamente",
            data: Object.values(trasladosMap)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error obteniendo traslados",
            data: null,
            errors: [error.message]
        });
    }
};



export const actualizarEstadoTraslado = async (req, res) => {
    try {
        const { id } = req.params; // id del traslado
        const { nuevoEstado } = req.body; // nombre del nuevo estado

        if (!nuevoEstado) {
            return res.status(400).json({
                success: false,
                message: "Debes enviar el nuevo estado",
                data: null
            });
        }

        // Verificar si el traslado existe
        const [trasladoRows] = await pool.query(
            `SELECT t.id_traslado, t.id_usuario, t.fecha_registro
             FROM traslado t
             WHERE t.id_traslado = ?`,
            [id]
        );

        if (trasladoRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Traslado no encontrado",
                data: null
            });
        }

        const traslado = trasladoRows[0];

        // Obtener el id del nuevo estado
        const [estadoRows] = await pool.query(
            `SELECT id_estado FROM estado WHERE nombre = ?`,
            [nuevoEstado]
        );

        if (estadoRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Estado no válido",
                data: null
            });
        }

        const idNuevoEstado = estadoRows[0].id_estado;

        // Actualizar el estado del traslado
        await pool.query(
            `UPDATE traslado SET id_estado = ? WHERE id_traslado = ?`,
            [idNuevoEstado, id]
        );

        // Obtener datos del cliente
        const [clienteRows] = await pool.query(
            `SELECT nombres, apellidos, dni, celular, ciudad, direccion, email
             FROM usuario
             WHERE id_usuario = ?`,
            [traslado.id_usuario]
        );

        const cliente = clienteRows[0];

        return res.json({
            success: true,
            message: `Estado del traslado actualizado a '${nuevoEstado}'`,
            data: {
                idTraslado: traslado.id_traslado,
                fechaRegistro: traslado.fecha_registro,
                cliente
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error al actualizar estado del traslado",
            data: null,
            errors: [error.message]
        });
    }
};


export const registerMassiveTrasladoWithKm = async (req, res) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const { origen, destino, fechaRegistro, estado, cliente, items } = req.body;

        if (!origen || !destino || !cliente || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos obligatorios",
                data: null,
                errors: ["origen, destino, cliente e items son requeridos"]
            });
        }

        // 1️⃣ Buscar ruta
        const [rutaRows] = await conn.query(
            `SELECT distancia_km 
             FROM ruta_empresa 
             WHERE origen = ? AND destino = ? AND estado = 1`,
            [origen, destino]
        );

        if (rutaRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No existe ruta disponible entre ${origen} y ${destino}`,
                data: null,
                errors: []
            });
        }


        const distanciaKm = Number(rutaRows[0].distancia_km);

        // 2️⃣ Fecha
        const fechaRegistroFormatted = fechaRegistro
            ? new Date(fechaRegistro).toISOString().slice(0, 19).replace('T', ' ')
            : new Date().toISOString().slice(0, 19).replace('T', ' ');

        // 3️⃣ Estado
        const [estadoRow] = await conn.query(
            "SELECT id_estado FROM estado WHERE nombre = ?",
            [estado]
        );

        const estadoId = estadoRow.length
            ? estadoRow[0].id_estado
            : (await conn.query(
                "INSERT INTO estado (nombre) VALUES (?)",
                [estado]
            ))[0].insertId;

        // 4️⃣ Cliente
        const [existingUser] = await conn.query(
            "SELECT id_usuario, id_tipo_usuario FROM usuario WHERE dni = ? OR email = ?",
            [cliente.dni, cliente.email]
        );

        let clienteId;
        let tipoUsuarioFinal;

        if (existingUser.length) {
            clienteId = existingUser[0].id_usuario;
            tipoUsuarioFinal = existingUser[0].id_tipo_usuario;
        } else {
            let [tipoCliente] = await conn.query(
                "SELECT id_tipo_usuario FROM tipo_usuario WHERE nombre = 'cliente'"
            );

            const tipoClienteId = tipoCliente.length
                ? tipoCliente[0].id_tipo_usuario
                : (await conn.query(
                    "INSERT INTO tipo_usuario (nombre) VALUES ('cliente')"
                ))[0].insertId;

            const [newUser] = await conn.query(
                `INSERT INTO usuario
                (id_tipo_usuario, nombres, apellidos, dni, celular, ciudad, direccion, email)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    tipoClienteId,
                    cliente.nombres,
                    cliente.apellidos,
                    cliente.dni,
                    cliente.celular,
                    cliente.ciudad,
                    cliente.direccion,
                    cliente.email
                ]
            );

            clienteId = newUser.insertId;
            tipoUsuarioFinal = tipoClienteId;
        }

        // 5️⃣ Crear traslado
        const [trasladoResult] = await conn.query(
            `INSERT INTO traslado (id_usuario, origen, destino, fecha_registro, id_estado)
             VALUES (?, ?, ?, ?, ?)`,
            [clienteId, origen, destino, fechaRegistroFormatted, estadoId]
        );

        const trasladoId = trasladoResult.insertId;

        let totalTraslado = 0;
        const productosRegistrados = [];

        // 6️⃣ Items
        for (const item of items) {

            const [[tarifa]] = await conn.query(
                "SELECT * FROM tarifa WHERE nombre = ?",
                [item.tarifa]
            );

            if (!tarifa) {
                throw new Error(`La tarifa '${item.tarifa}' no existe`);
            }

            const peso = Number(item.peso) || 0;
            const volumen = (item.alto * item.ancho * item.largo) / 1000000;

            let precioUnitario =
                Number(tarifa.precio_base) +
                (Number(tarifa.precio_por_kg) * peso) +
                (Number(tarifa.precio_por_m3) * volumen) +
                (Number(tarifa.precio_por_km) * distanciaKm);

            precioUnitario = parseFloat(precioUnitario.toFixed(2));

            const [productoResult] = await conn.query(
                `INSERT INTO producto_cliente
                (id_traslado, id_usuario, nombre, descripcion, peso, alto, ancho, largo,
                 cantidad, id_tarifa, precio_unitario)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    trasladoId, clienteId,
                    item.nombre, item.descripcion,
                    item.peso, item.alto, item.ancho, item.largo,
                    item.cantidad || 1,
                    tarifa.id_tarifa,
                    precioUnitario
                ]
            );

            const subtotal = precioUnitario * (item.cantidad || 1);
            totalTraslado += subtotal;

            productosRegistrados.push({
                id_producto: productoResult.insertId,
                nombre: item.nombre,
                tipoProducto: item.tipoProducto,
                tarifa: item.tarifa,
                precioUnitario,
                cantidad: item.cantidad || 1,
                subtotal: parseFloat(subtotal.toFixed(2)),
                imageUrls: item.imageUrls || []
            });
        }

        // 7️⃣ Total
        await conn.query(
            "UPDATE traslado SET precio_total = ? WHERE id_traslado = ?",
            [parseFloat(totalTraslado.toFixed(2)), trasladoId]
        );

        await conn.commit();

        res.json({
            success: true,
            message: "Traslado registrado exitosamente",
            data: {
                id_traslado: trasladoId,
                origen,
                destino,
                estado,
                cliente: {
                    id_usuario: clienteId,
                    tipo_usuario: tipoUsuarioFinal,
                    ...cliente
                },
                total: parseFloat(totalTraslado.toFixed(2)),
                productos: productosRegistrados
            },
            errors: []
        });

    } catch (error) {
        await conn.rollback();
        res.status(500).json({
            success: false,
            message: "Error registrando traslado con ruta",
            data: null,
            errors: [error.message]
        });
    } finally {
        conn.release();
    }
};

