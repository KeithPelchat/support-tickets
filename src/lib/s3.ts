import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
}

export interface UploadError {
  error: string;
  filename?: string;
}

function isS3Configured(): boolean {
  return !!(
    process.env.AWS_S3_BUCKET_NAME &&
    process.env.AWS_S3_ACCESS_KEY_ID &&
    process.env.AWS_S3_SECRET_ACCESS_KEY
  );
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 100);
}

function generateUniqueFilename(requestId: string, originalFilename: string): string {
  const timestamp = Date.now();
  const sanitized = sanitizeFilename(originalFilename);
  return `${requestId}/${timestamp}_${sanitized}`;
}

export function validateFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): UploadError | null {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      error: `File type not allowed: ${mimeType}. Allowed types: PNG, JPEG, GIF, WebP`,
      filename,
    };
  }

  if (buffer.length > MAX_FILE_SIZE) {
    return {
      error: `File too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB. Maximum size: 5MB`,
      filename,
    };
  }

  // Basic check for executable headers (security measure)
  const header = buffer.slice(0, 4).toString('hex');
  const executableHeaders = ['4d5a', '7f454c46', 'cafebabe']; // MZ (Windows), ELF (Linux), Mach-O
  if (executableHeaders.some((h) => header.startsWith(h))) {
    return {
      error: 'File appears to be an executable and is not allowed',
      filename,
    };
  }

  return null;
}

export async function uploadToS3(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  requestId: string
): Promise<UploadResult | UploadError> {
  const validationError = validateFile(buffer, filename, mimeType);
  if (validationError) {
    return validationError;
  }

  if (!isS3Configured()) {
    console.log('S3 not configured, using local storage fallback');
    return uploadToLocal(buffer, filename, requestId);
  }

  const key = generateUniqueFilename(requestId, filename);

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);

    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return {
      url,
      filename,
      size: buffer.length,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      error: 'Failed to upload file to storage',
      filename,
    };
  }
}

// Local storage fallback for development/MVP
async function uploadToLocal(
  buffer: Buffer,
  filename: string,
  requestId: string
): Promise<UploadResult> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', requestId);
  await fs.mkdir(uploadDir, { recursive: true });

  const sanitizedFilename = `${Date.now()}_${sanitizeFilename(filename)}`;
  const filePath = path.join(uploadDir, sanitizedFilename);

  await fs.writeFile(filePath, buffer);

  return {
    url: `/uploads/${requestId}/${sanitizedFilename}`,
    filename,
    size: buffer.length,
  };
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  if (!isS3Configured()) {
    return key; // Return as-is for local files
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export function isUploadError(result: UploadResult | UploadError): result is UploadError {
  return 'error' in result;
}
