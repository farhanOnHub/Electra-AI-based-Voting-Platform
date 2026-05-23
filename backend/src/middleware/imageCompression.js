import sharp from 'sharp';

/**
 * Image compression middleware
 * Compresses and optimizes uploaded images
 */
export const compressImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const { path, mimetype } = req.file;

    // Only process image files
    if (!mimetype.startsWith('image/')) {
      return next();
    }

    // Compress image
    const compressedPath = path.replace(/(\.[\w\d]+)$/, '_compressed$1');
    
    await sharp(path)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(compressedPath);

    // Replace original file with compressed version
    req.file.path = compressedPath;
    req.file.filename = req.file.filename.replace(/(\.[\w\d]+)$/, '_compressed.webp');
    req.file.originalname = req.file.originalname.replace(/(\.[\w\d]+)$/, '_compressed.webp');

    next();
  } catch (error) {
    console.error('Image compression error:', error);
    // Continue without compression if it fails
    next();
  }
};

/**
 * Generate different image sizes for responsive loading
 */
export const generateImageSizes = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const { path } = req.file;
    const sizes = [
      { name: 'small', width: 300 },
      { name: 'medium', width: 600 },
      { name: 'large', width: 1200 }
    ];

    req.file.sizes = {};

    for (const size of sizes) {
      const sizePath = path.replace(/(\.[\w\d]+)$/, `_${size.name}$1`);
      
      await sharp(path)
        .resize(size.width, size.width, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toFile(sizePath);

      req.file.sizes[size.name] = sizePath;
    }

    next();
  } catch (error) {
    console.error('Image size generation error:', error);
    // Continue without size generation if it fails
    next();
  }
};
