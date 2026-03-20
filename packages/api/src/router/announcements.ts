import { z } from 'zod';
import { router, protectedProcedure, officeProcedure } from '../trpc';

export const announcementsRouter = router({
  /**
   * List announcements visible to the current user.
   */
  list: protectedProcedure
    .input(
      z.object({
        buildingId: z.string().uuid().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Query announcements filtered by user's buildings/office
      void ctx.db;
      void input;
      return {
        items: [] as Array<{
          id: string;
          title: string;
          body: string;
          buildingId: string | null;
          createdAt: Date;
        }>,
        total: 0,
      };
    }),

  /**
   * Create an announcement (office publishes to tenants).
   */
  create: officeProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        body: z.string().min(1).max(5000),
        buildingId: z.string().uuid().optional(),
        notifyTenants: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Create announcement, optionally send push notifications
      void ctx.db;
      void input;
      return { id: '' };
    }),
});
