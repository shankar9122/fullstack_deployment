import multer from 'multer';
import { AppError } from '../utils/AppError.js';

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadPhoto = multer({
  // The file stays in memory: it is cleaned up and sent to Cloudinary, never written to disk
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 0 },
  fileFilter(req, file, cb) {
    // The declared type is easy to fake, so this only rejects obvious mistakes early.
    // The real check is decoding the bytes with sharp in the controller
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Only JPEG, PNG or WebP images are allowed', 400));
    }
    cb(null, true);
  },
}).single('photo'); // the form field must be called "photo"
