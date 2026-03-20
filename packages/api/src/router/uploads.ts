import { router, protectedProcedure } from '../trpc';
import { presignedUrlSchema } from '../validators';
import {
  validateContentType,
  generateKey,
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
} from '../services/storage';
import { FaseelError } from '../errors';
import { z } from 'zod';

export const uploadsRouter = router({
  /**
   * Get a presigned URL for uploading a file to object storage.
   * Validates content type and enforces size limits.
   */
  getPresignedUrl: protectedProcedure.input(presignedUrlSchema).mutation(async ({ ctx, input }) => {
    const validation = validateContentType(input.contentType);
    if (!validation.valid) {
      throw new FaseelError('VALIDATION_ERROR', {
        messageAr: `نوع الملف غير مدعوم: ${input.contentType}`,
        messageEn: `Unsupported file type: ${input.contentType}`,
      });
    }

    // Use officeId from the user session, or a default for tenants
    const officeId = ctx.user.officeId ?? 'shared';

    const key = generateKey(officeId, input.entityType, input.entityId, input.contentType);
    const result = await getPresignedUploadUrl(key, input.contentType, validation.maxSizeMb);

    return {
      uploadUrl: result.uploadUrl,
      key: result.key,
      expiresAt: result.expiresAt,
      maxSizeMb: validation.maxSizeMb,
    };
  }),

  /**
   * Get a presigned URL for downloading a file from object storage.
   */
  getDownloadUrl: protectedProcedure
    .input(
      z.object({
        key: z.string().min(1, { message: 'مفتاح الملف مطلوب | File key is required' }),
      }),
    )
    .query(async ({ input }) => {
      const result = await getPresignedDownloadUrl(input.key);
      return {
        downloadUrl: result.downloadUrl,
        expiresAt: result.expiresAt,
      };
    }),
});
