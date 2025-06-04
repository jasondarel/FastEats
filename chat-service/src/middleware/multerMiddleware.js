import { responseError, responseSuccess } from "../util/responseUtil.js";
import multerUpload from "./multerConfigMiddleware.js";
import { fileURLToPath } from 'url';
import multer from 'multer';
import logger from "../config/loggerInit.js";

const __filename = fileURLToPath(import.meta.url);
const uploadLocation = "../uploads/chat";
const upload = multerUpload(__filename, uploadLocation);

const multerMiddleware = (fieldName) => (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
        if (err) {
            logger.error(`Multer error: ${err.message}`, { error: err });
            if (err instanceof multer.MulterError) {
                return responseError(res, 400, err.message);
            } else if (err.message === "Unsupported file type") {
                return responseError(res, 400, "Invalid file type. Only JPEG, PNG, and PDF files are allowed.");
            }
            
            return responseError(res, 500, "File upload failed due to an unexpected error.");
        }
        next();
    });
};

export default multerMiddleware;