import { randomUUID } from 'crypto';

interface S3Config {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string; // For S3-compatible services (R2, MinIO, etc.)
}

/**
 * Content type validation and size limits.
 */
const ALLOWED_CONTENT_TYPES: Record<string, { maxSizeMb: number; category: string }> = {
  'image/jpeg': { maxSizeMb: 10, category: 'image' },
  'image/png': { maxSizeMb: 10, category: 'image' },
  'image/webp': { maxSizeMb: 10, category: 'image' },
  'image/heic': { maxSizeMb: 10, category: 'image' },
  'video/mp4': { maxSizeMb: 50, category: 'video' },
  'video/quicktime': { maxSizeMb: 50, category: 'video' },
  'application/pdf': { maxSizeMb: 25, category: 'document' },
};

function getExtFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'application/pdf': 'pdf',
  };
  return map[contentType] ?? 'bin';
}

function getS3Config(): S3Config | null {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION ?? process.env.AWS_REGION;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    endpoint: process.env.S3_ENDPOINT,
  };
}

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  expiresAt: Date;
}

export interface PresignedDownloadResult {
  downloadUrl: string;
  expiresAt: Date;
}

/**
 * Validate that the content type is allowed and within size limits.
 */
export function validateContentType(contentType: string): {
  valid: boolean;
  maxSizeMb: number;
  category: string;
  error?: string;
} {
  const allowed = ALLOWED_CONTENT_TYPES[contentType];
  if (!allowed) {
    return {
      valid: false,
      maxSizeMb: 0,
      category: 'unknown',
      error: `Content type "${contentType}" is not allowed. Supported: ${Object.keys(ALLOWED_CONTENT_TYPES).join(', ')}`,
    };
  }
  return { valid: true, maxSizeMb: allowed.maxSizeMb, category: allowed.category };
}

/**
 * Generate the S3 key for a file upload.
 * Format: faseel/{officeId}/{entityType}/{entityId}/{uuid}.{ext}
 */
export function generateKey(
  officeId: string,
  entityType: string,
  entityId: string,
  contentType: string,
): string {
  const ext = getExtFromContentType(contentType);
  const fileId = randomUUID();
  return `faseel/${officeId}/${entityType}/${entityId}/${fileId}.${ext}`;
}

/**
 * Generate a presigned URL for uploading a file to S3.
 * In dev mode (no S3 credentials), returns a mock URL.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  maxSizeMb: number,
): Promise<PresignedUploadResult> {
  const config = getS3Config();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  if (!config) {
    // Dev mode: return mock URL
    return {
      uploadUrl: `https://mock-s3.faseel.dev/upload/${key}?contentType=${encodeURIComponent(contentType)}&maxSize=${maxSizeMb}MB`,
      key,
      expiresAt,
    };
  }

  // Production: use AWS SDK to generate presigned URL
  // Using the @aws-sdk/s3-request-presigner approach
  try {
    // Dynamic imports: @aws-sdk packages are optional production dependencies
    // @ts-expect-error -- Optional dependency, installed only when S3 is configured
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    // @ts-expect-error -- Optional dependency
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    const client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpoint ? { endpoint: config.endpoint, forcePathStyle: true } : {}),
    });

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: maxSizeMb * 1024 * 1024,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

    return { uploadUrl, key, expiresAt };
  } catch (err) {
    console.error('Failed to generate presigned upload URL:', err);
    // Fallback to mock in case of SDK issues
    return {
      uploadUrl: `https://mock-s3.faseel.dev/upload/${key}?error=sdk_unavailable`,
      key,
      expiresAt,
    };
  }
}

/**
 * Generate a presigned URL for downloading a file from S3.
 * In dev mode (no S3 credentials), returns a mock URL.
 */
export async function getPresignedDownloadUrl(key: string): Promise<PresignedDownloadResult> {
  const config = getS3Config();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  if (!config) {
    return {
      downloadUrl: `https://mock-s3.faseel.dev/download/${key}`,
      expiresAt,
    };
  }

  try {
    // @ts-expect-error -- Optional dependency, installed only when S3 is configured
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
    // @ts-expect-error -- Optional dependency
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    const client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpoint ? { endpoint: config.endpoint, forcePathStyle: true } : {}),
    });

    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

    return { downloadUrl, expiresAt };
  } catch (err) {
    console.error('Failed to generate presigned download URL:', err);
    return {
      downloadUrl: `https://mock-s3.faseel.dev/download/${key}?error=sdk_unavailable`,
      expiresAt,
    };
  }
}
