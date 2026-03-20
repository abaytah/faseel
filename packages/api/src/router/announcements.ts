import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and, desc, count, or, isNull, inArray } from 'drizzle-orm';
import { router, protectedProcedure, officeProcedure } from '../trpc';
import { announcements, buildings, units, tenantContracts } from '@faseel/db';

export const announcementsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        buildingId: z.string().uuid().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const offset = (input.page - 1) * input.limit;

      let whereClause;

      if (user.role === 'office' && user.officeId) {
        // Office sees all their announcements
        const conditions: ReturnType<typeof eq>[] = [eq(announcements.officeId, user.officeId)];
        if (input.buildingId) {
          conditions.push(eq(announcements.buildingId, input.buildingId));
        }
        whereClause = and(...conditions);
      } else if (user.role === 'tenant') {
        // Tenant sees announcements for their buildings
        const tenantUnits = await ctx.db
          .select({ buildingId: units.buildingId })
          .from(units)
          .where(eq(units.tenantId, user.id));

        const buildingIds = tenantUnits.map((u) => u.buildingId);

        if (buildingIds.length === 0) {
          return { items: [], total: 0 };
        }

        // Announcements for tenant's buildings or office-wide (null buildingId)
        const tenantBuildings = await ctx.db
          .select({ officeId: buildings.officeId })
          .from(buildings)
          .where(inArray(buildings.id, buildingIds));

        const officeIds = [...new Set(tenantBuildings.map((b) => b.officeId))];

        if (officeIds.length === 0) {
          return { items: [], total: 0 };
        }

        whereClause = and(
          inArray(announcements.officeId, officeIds),
          or(inArray(announcements.buildingId, buildingIds), isNull(announcements.buildingId)),
        );
      } else {
        return { items: [], total: 0 };
      }

      const items = await ctx.db
        .select()
        .from(announcements)
        .where(whereClause)
        .orderBy(desc(announcements.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [totalRow] = await ctx.db
        .select({ value: count() })
        .from(announcements)
        .where(whereClause);

      return {
        items,
        total: totalRow?.value ?? 0,
      };
    }),

  create: officeProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        titleEn: z.string().max(255).optional(),
        body: z.string().min(1).max(5000),
        bodyEn: z.string().max(5000).optional(),
        buildingId: z.string().uuid().optional(),
        type: z.enum(['general', 'maintenance', 'payment', 'emergency']).default('general'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.officeId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: JSON.stringify({
            message: 'No office associated with your account.',
            messageAr: 'لا يوجد مكتب مرتبط بحسابك.',
            code: 'NO_OFFICE',
          }),
        });
      }

      // If buildingId is provided, verify it belongs to this office
      if (input.buildingId) {
        const [building] = await ctx.db
          .select()
          .from(buildings)
          .where(eq(buildings.id, input.buildingId))
          .limit(1);

        if (!building || building.officeId !== ctx.user.officeId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: JSON.stringify({
              message: 'Building does not belong to your office.',
              messageAr: 'المبنى لا ينتمي لمكتبك.',
              code: 'BUILDING_ACCESS_DENIED',
            }),
          });
        }
      }

      const [announcement] = await ctx.db
        .insert(announcements)
        .values({
          officeId: ctx.user.officeId,
          buildingId: input.buildingId,
          titleAr: input.title,
          titleEn: input.titleEn,
          bodyAr: input.body,
          bodyEn: input.bodyEn,
          type: input.type,
        })
        .returning();

      return { id: announcement!.id };
    }),
});
