import { pool } from "../../db.js";

// Crear imagen
export const crearImagenWeb = async (req, res) => {
  try {
    const { nombre, url } = req.body;

    if (!nombre || !url) {
      return res.status(400).json({
        success: false,
        message: "Debes enviar nombre y url de la imagen",
        data: null
      });
    }

    const [result] = await pool.query(
      "INSERT INTO img_web (nombre, url) VALUES (?, ?)",
      [nombre, url]
    );

    return res.json({
      success: true,
      message: "Imagen registrada correctamente",
      data: {
        id: result.insertId,
        nombre,
        url
      }
    });

  } catch (error) {
    console.error("ERROR REAL:", error);
    return res.status(500).json({
      success: false,
      message: "Error al registrar la imagen",
      data: null,
      errors: [error.message]
    });
  }
};

// Actualizar imagen
export const actualizarImagenWeb = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, url } = req.body;

    if (!nombre || !url) {
      return res.status(400).json({
        success: false,
        message: "Debes enviar nombre y url de la imagen",
        data: null
      });
    }

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
    console.error("ERROR REAL:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar la imagen",
      data: null,
      errors: [error.message]
    });
  }
};

// Obtener todas las imágenes
export const obtenerImagenesWeb = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_img_web AS id, nombre, url FROM img_web ORDER BY id_img_web DESC"
    );

    return res.json({
      success: true,
      message: "Imágenes obtenidas correctamente",
      data: rows
    });

  } catch (error) {
    console.error("ERROR REAL:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener imágenes",
      data: null,
      errors: [error.message]
    });
  }
};

// Obtener imagen por ID
export const obtenerImagenWebPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Debes enviar el ID de la imagen",
        data: null
      });
    }

    const [rows] = await pool.query(
      "SELECT id_img_web AS id, nombre, url FROM img_web WHERE id_img_web = ?",
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
    console.error("ERROR REAL:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la imagen",
      data: null,
      errors: [error.message]
    });
  }
};
