import app from './app.js';
import { connectDB } from './config/db.js';
import { assertPhotoStorageConfigured } from './services/photoStorage.js';

const PORT = process.env.PORT || 3000;

try {
  assertPhotoStorageConfigured();
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}
