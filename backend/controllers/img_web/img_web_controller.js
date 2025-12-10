import { pool } from "../../db.js";

// Crear imagen
export const crearImagenWeb = async (req, res) => {
  try {
    console.log("REQ FILE:", JSON.stringify(req.file, null, 2));
    console.log("REQ BODY:", JSON.stringify(req.body, null, 2));

    if (!req.file) {
      console.log("No hay archivo en req.file");
      return res.status(400).json({
        success: false,
        message: "No se ha subido ninguna imagen",
        data: null
      });
    }

    const { originalname } = req.file;
    const nombre = req.body.nombre || originalname;
    const url = req.file?.path || req.file?.filename || req.file?.secure_url;

    console.log("URL final:", url);

    const [result] = await pool.query(
      "INSERT INTO img_web (nombre, url) VALUES (?, ?)",
      [nombre, url]
    );

    return res.json({
      success: true,
      message: "Imagen subida correctamente",
      data: {
        id: result.insertId,
        nombre,
        url
      }
    });

  } catch (error) {
    console.error("ERROR REAL:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return res.status(500).json({
      success: false,
      message: "Error al subir la imagen",
      data: null,
      errors: [error.message, error.stack]
    });
  }
};

// Actualizar imagen
export const actualizarImagenWeb = async (req, res) => {
  try {
    console.log("REQ FILE:", JSON.stringify(req.file, null, 2));
    console.log("REQ BODY:", JSON.stringify(req.body, null, 2));

    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se ha subido ninguna imagen",
        data: null
      });
    }

    const nombre = req.body.nombre || "imagen_actualizada";
    const url = req.file?.path || req.file?.filename || req.file?.secure_url;

    const [result] = await pool.query(
      "UPDATE img_web SET nombre = ?, url = ? WHERE id_img_web = ?",
      [nombre, url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontró la imagen con ese ID",
        data: null
      });
    }

    return res.json({
      success: true,
      message: "Imagen actualizada correctamente",
      data: {
        id,
        nombre,
        url
      }
    });

  } catch (error) {
    console.error("ERROR REAL:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return res.status(500).json({
      success: false,
      message: "Error al actualizar la imagen",
      data: null,
      errors: [error.message, error.stack]
    });
  }
};

// Obtener todas las imágenes
export const obtenerImagenesWeb = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM img_web ORDER BY id_img_web DESC"
    );
    return res.json({
      success: true,
      message: "Imágenes obtenidas correctamente",
      data: rows
    });
  } catch (error) {
    console.error("ERROR REAL:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return res.status(500).json({
      success: false,
      message: "Error al obtener imágenes",
      data: null,
      errors: [error.message, error.stack]
    });
  }
};

// Obtener imagen por ID
export const obtenerImagenWebPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM img_web WHERE id_img_web = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontró la imagen con ese ID",
        data: null
      });
    }

    return res.json({
      success: true,
      message: "Imagen obtenida correctamente",
      data: rows[0]
    });
  } catch (error) {
    console.error("ERROR REAL:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return res.status(500).json({
      success: false,
      message: "Error al obtener la imagen",
      data: null,
      errors: [error.message, error.stack]
    });
  }
};
