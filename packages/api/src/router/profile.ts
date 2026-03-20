import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { router, protectedProcedure } from '../trpc';
import { users, userRoles } from '@faseel/db';

export const profileRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);

    if (!user) {
      return null;
    }

    const roles = await ctx.db.select().from(userRoles).where(eq(userRoles.userId, ctx.user.id));

    return {
      id: user.id,
      phone: user.phone,
      nameAr: user.nameAr,
      nameEn: user.nameEn,
      email: user.email,
      avatarUrl: user.avatarUrl,
      roles: roles.map((r) => ({
        role: r.role,
        officeId: r.officeId,
      })),
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        nameAr: z.string().min(1).max(255).optional(),
        nameEn: z.string().max(255).optional(),
        email: z.string().email().max(255).optional().nullable(),
        avatarUrl: z.string().url().max(2048).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {};
      if (input.nameAr !== undefined) updateData.nameAr = input.nameAr;
      if (input.nameEn !== undefined) updateData.nameEn = input.nameEn;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl;

      if (Object.keys(updateData).length === 0) {
        return { success: true };
      }

      await ctx.db.update(users).set(updateData).where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  completeOnboarding: protectedProcedure
    .input(
      z.object({
        nameAr: z.string().min(1).max(255),
        nameEn: z.string().max(255).optional(),
        email: z.string().email().max(255).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {
        nameAr: input.nameAr,
      };
      if (input.nameEn !== undefined) updateData.nameEn = input.nameEn;
      if (input.email !== undefined) updateData.email = input.email;

      await ctx.db.update(users).set(updateData).where(eq(users.id, ctx.user.id));

      // Re-fetch user for updated localStorage data
      const [updatedUser] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      return {
        success: true,
        user: updatedUser
          ? {
              id: updatedUser.id,
              phone: updatedUser.phone,
              nameAr: updatedUser.nameAr,
              nameEn: updatedUser.nameEn,
            }
          : null,
      };
    }),
});
