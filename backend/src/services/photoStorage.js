import { v2 as cloudinary } from 'cloudinary';

// Keeps development and production uploads apart if they share one Cloudinary account
const FOLDER = `school-management/${process.env.NODE_ENV === 'production' ? 'prod' : 'dev'}/students`;

let configured = false;

// Configuration is lazy on purpose: seed scripts import the Student model, and they must still
// run on a machine that has no Cloudinary keys
function ensureConfigured() {
  if (configured) return;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      'Cloudinary is not configured: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET',
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

// Called once at startup, so a missing key fails the deploy instead of the first upload
export const assertPhotoStorageConfigured = ensureConfigured;

// Uploads an already processed image. Returns what we need to build URLs later
export function storePhoto(studentId, buffer) {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        public_id: studentId,
        unique_filename: false,
        resource_type: 'image',
        // "authenticated": neither the image nor any derived version is reachable without a signed URL
        type: 'authenticated',
        overwrite: true,
        invalidate: true, // purge the CDN copy of a replaced photo
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Empty response from Cloudinary'));
        resolve({ publicId: result.public_id, version: result.version });
      },
    );

    stream.end(buffer);
  });
}

export async function removePhoto(publicId) {
  ensureConfigured();

  const result = await cloudinary.uploader.destroy(publicId, {
    type: 'authenticated',
    resource_type: 'image',
    invalidate: true,
  });

  // "not found" means it is already gone, which is the outcome we wanted
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error(`Cloudinary did not delete the photo: ${result.result}`);
  }
}

// A signed URL is computed locally from the API secret (no network call).
// Changing the signature makes Cloudinary reject the URL, so it cannot be forged or guessed
export function getPhotoUrl({ publicId, version }) {
  ensureConfigured();

  return cloudinary.url(publicId, {
    type: 'authenticated',
    resource_type: 'image',
    sign_url: true,
    secure: true,
    version,
    format: 'webp',
  });
}
