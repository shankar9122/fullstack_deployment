import sharp from 'sharp';
import { Student } from '../models/Student.js';
import { getPhotoUrl, removePhoto, storePhoto } from '../services/photoStorage.js';
import { AppError } from '../utils/AppError.js';

const PHOTO_SIZE = 256;
const ALLOWED_FORMATS = ['jpeg', 'png', 'webp'];
const MAX_INPUT_PIXELS = 24_000_000; // guards against "decompression bombs" (tiny files, huge images)

// Decodes the upload and returns a clean 256x256 WebP.
// Re-encoding drops EXIF metadata (GPS location, camera details), so it never reaches Cloudinary
async function processPhoto(buffer) {
  try {
    const image = sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS });

    // The real format comes from the bytes, not from what the client claimed
    const { format } = await image.metadata();
    if (!ALLOWED_FORMATS.includes(format)) throw new Error('Unsupported format');

    return await image
      .rotate() // apply the camera's orientation first, then the EXIF data is discarded
      .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new AppError('The file is not a valid JPEG, PNG or WebP image', 400);
  }
}

// PUT /api/students/:id/photo (admin only, replaces any existing photo)
export async function uploadStudentPhoto(req, res) {
  if (!req.file) {
    throw new AppError('Choose an image to upload (form field "photo")', 400);
  }

  const student = await Student.findById(req.params.id).select('_id');
  if (!student) throw new AppError('Student not found', 404);

  const data = await processPhoto(req.file.buffer);

  let stored;
  try {
    stored = await storePhoto(student.id, data);
  } catch (error) {
    // Log the details, but do not leak them to the client
    console.error('Photo upload to Cloudinary failed:', error);
    throw new AppError('Could not store the photo, please try again', 502);
  }

  await Student.updateOne({ _id: student._id }, { photo: stored });

  res.json({ photoUrl: getPhotoUrl(stored) });
}

// DELETE /api/students/:id/photo (admin only)
export async function removeStudentPhoto(req, res) {
  const student = await Student.findById(req.params.id).select('photo');
  if (!student) throw new AppError('Student not found', 404);

  if (!student.photo?.publicId) throw new AppError('Student has no photo', 404);

  // Delete the remote file first. If that fails, the database still points at it and we can retry
  try {
    await removePhoto(student.photo.publicId);
  } catch (error) {
    console.error('Photo removal from Cloudinary failed:', error);
    throw new AppError('Could not remove the photo, please try again', 502);
  }

  await Student.updateOne({ _id: student._id }, { $unset: { photo: 1 } });

  res.json({ message: 'Photo removed' });
}
