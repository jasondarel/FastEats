import multer from 'multer';
import path from 'path';

const multerUpload = (fileName, uploadLocation) => {
    const __dirname = path.dirname(fileName);
    const uploadDir = path.join(__dirname, uploadLocation);

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname);
        },
    });

    return multer({ storage });
}

export default multerUpload;