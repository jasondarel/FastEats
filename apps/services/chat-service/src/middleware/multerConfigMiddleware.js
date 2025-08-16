import multer from 'multer';
import path from 'path';
import fs from 'fs';

const multerUpload = (fileName, uploadLocation) => {
    const __dirname = path.dirname(fileName);
    const uploadDir = path.resolve(__dirname, uploadLocation);

    fs.mkdirSync(uploadDir, { recursive: true });

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + file.originalname;
            cb(null, uniqueSuffix);
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'), false);
        }
    };
    return multer({ 
        storage,
        fileFilter
    });
};

export default multerUpload;