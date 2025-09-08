import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'giftgalore',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
  } as any,
});

// Create multer upload middleware
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

// Function to delete image from Cloudinary
export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Function to upload image from URL
export const uploadFromUrl = async (imageUrl: string, folder: string = 'giftgalore') => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
    });
    return result;
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    throw error;
  }
};

// Function to get optimized image URL
export const getOptimizedUrl = (publicId: string, options: any = {}) => {
  const defaultOptions = {
    width: 800,
    height: 800,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
  };
  
  return cloudinary.url(publicId, {
    ...defaultOptions,
    ...options,
  });
};

export default cloudinary;
