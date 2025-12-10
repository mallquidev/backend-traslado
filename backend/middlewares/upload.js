import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const nombreBase = req.body.nombre || "imagen";

    const fecha = new Date();
    const fechaStr = `${fecha.getFullYear()}${(fecha.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${fecha.getDate().toString().padStart(2, "0")}_${fecha
      .getHours()
      .toString()
      .padStart(2, "0")}${fecha.getMinutes().toString().padStart(2, "0")}${fecha
      .getSeconds()
      .toString()
      .padStart(2, "0")}${fecha.getMilliseconds().toString().padStart(3, "0")}`;

    return {
      folder: "sistema_traslado_img",
      public_id: `${nombreBase}_${fechaStr}`,
      allowed_formats: ["jpg", "png", "jpeg", "webp"]
    };
  }
});

const upload = multer({ storage });

export default upload;
