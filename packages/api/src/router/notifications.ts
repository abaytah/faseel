import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const notificationsRouter = router({
  /**
   * List notifications for the current user.
   */
  list: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Query notifications for ctx.user.id, optionally filter unread
      void ctx.db;
      void input;
      return {
        items: [] as Array<{
          id: string;
          type: string;
          title: string;
          body: string;
          read: boolean;
          createdAt: Date;
        }>,
        total: 0,
      };
    }),

  /**
   * Mark a single notification as read.
   */
  markRead: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Update notification read status, verify ownership
      void ctx.db;
      void input;
      return { success: true };
    }),

  /**
   * Mark all notifications as read.
   */
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    // TODO: Bulk update all unread notifications for ctx.user.id
    void ctx.db;
    return { success: true };
  }),
});
