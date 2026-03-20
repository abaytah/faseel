import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and, desc, count } from 'drizzle-orm';
import { router, protectedProcedure } from '../trpc';
import { notifications } from '@faseel/db';

export const notificationsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions: ReturnType<typeof eq>[] = [eq(notifications.userId, ctx.user.id)];

      if (input.unreadOnly) {
        conditions.push(eq(notifications.isRead, false));
      }

      const whereClause = and(...conditions);

      const items = await ctx.db
        .select()
        .from(notifications)
        .where(whereClause)
        .orderBy(desc(notifications.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [totalRow] = await ctx.db
        .select({ value: count() })
        .from(notifications)
        .where(whereClause);

      // Also get unread count for badge
      const [unreadRow] = await ctx.db
        .select({ value: count() })
        .from(notifications)
        .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, false)));

      return {
        items,
        total: totalRow?.value ?? 0,
        unreadCount: unreadRow?.value ?? 0,
      };
    }),

  markRead: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify notification belongs to user
      const [notification] = await ctx.db
        .select()
        .from(notifications)
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)))
        .limit(1);

      if (!notification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: JSON.stringify({
            message: 'Notification not found.',
            messageAr: 'الإشعار غير موجود.',
            code: 'NOTIFICATION_NOT_FOUND',
          }),
        });
      }

      await ctx.db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, input.id));

      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, false)));

    return { success: true };
  }),
});
