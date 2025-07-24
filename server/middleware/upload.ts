import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files in the uploads directory
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueName = `${nanoid()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter to validate file types
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Middleware for single file upload
export const uploadSingle = upload.single('file');

// Middleware for multiple file uploads
export const uploadMultiple = upload.array('files', 5);