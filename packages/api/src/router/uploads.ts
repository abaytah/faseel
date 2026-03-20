import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const uploadsRouter = router({
  /**
   * Get a presigned URL for uploading a file to object storage.
   */
  getPresignedUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        contentType: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Generate presigned URL from S3-compatible storage (e.g. Supabase Storage, R2)
      void ctx.db;
      void input;
      return {
        uploadUrl: '',
        fileUrl: '',
        expiresAt: new Date(),
      };
    }),
});
