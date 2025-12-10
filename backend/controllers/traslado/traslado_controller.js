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
