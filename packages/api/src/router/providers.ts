import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and, count } from 'drizzle-orm';
import { router, protectedProcedure, officeProcedure } from '../trpc';
import { serviceProviders, providerOfficeLinks, users, maintenanceRequests } from '@faseel/db';

export const providersRouter = router({
  list: officeProcedure
    .input(
      z.object({
        officeId: z.string().uuid(),
        category: z.string().optional(),
        status: z.enum(['active', 'inactive', 'pending', 'blocked']).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions: ReturnType<typeof eq>[] = [
        eq(providerOfficeLinks.officeId, input.officeId),
      ];

      if (input.status) {
        conditions.push(eq(providerOfficeLinks.status, input.status));
      }

      const rows = await ctx.db
        .select({
          id: serviceProviders.id,
          userId: serviceProviders.userId,
          nameAr: users.nameAr,
          nameEn: users.nameEn,
          phone: users.phone,
          specialties: serviceProviders.specialties,
          rating: serviceProviders.rating,
          totalJobs: serviceProviders.totalJobs,
          completedJobs: serviceProviders.completedJobs,
          linkStatus: providerOfficeLinks.status,
        })
        .from(providerOfficeLinks)
        .innerJoin(serviceProviders, eq(providerOfficeLinks.providerId, serviceProviders.id))
        .innerJoin(users, eq(serviceProviders.userId, users.id))
        .where(and(...conditions));

      // Filter by category in app layer (specialties is an array column)
      if (input.category) {
        return rows.filter((r) =>
          r.specialties.some((s) => s.toLowerCase() === input.category!.toLowerCase()),
        );
      }

      return rows;
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [provider] = await ctx.db
        .select({
          id: serviceProviders.id,
          userId: serviceProviders.userId,
          nameAr: users.nameAr,
          nameEn: users.nameEn,
          phone: users.phone,
          specialties: serviceProviders.specialties,
          rating: serviceProviders.rating,
          totalJobs: serviceProviders.totalJobs,
          completedJobs: serviceProviders.completedJobs,
          bio: serviceProviders.bio,
          createdAt: serviceProviders.createdAt,
        })
        .from(serviceProviders)
        .innerJoin(users, eq(serviceProviders.userId, users.id))
        .where(eq(serviceProviders.id, input.id))
        .limit(1);

      if (!provider) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: JSON.stringify({
            message: 'Service provider not found.',
            messageAr: 'مزود الخدمة غير موجود.',
            code: 'PROVIDER_NOT_FOUND',
          }),
        });
      }

      // Get completion stats
      const [completedCount] = await ctx.db
        .select({ value: count() })
        .from(maintenanceRequests)
        .where(
          and(
            eq(maintenanceRequests.assignedProviderId, provider.userId),
            eq(maintenanceRequests.status, 'COMPLETED'),
          ),
        );

      const [activeCount] = await ctx.db
        .select({ value: count() })
        .from(maintenanceRequests)
        .where(
          and(
            eq(maintenanceRequests.assignedProviderId, provider.userId),
            eq(maintenanceRequests.status, 'IN_PROGRESS'),
          ),
        );

      return {
        ...provider,
        stats: {
          completedRequests: completedCount?.value ?? 0,
          activeRequests: activeCount?.value ?? 0,
        },
      };
    }),

  linkToOffice: officeProcedure
    .input(
      z.object({
        providerId: z.string().uuid(),
        officeId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify provider exists
      const [provider] = await ctx.db
        .select()
        .from(serviceProviders)
        .where(eq(serviceProviders.id, input.providerId))
        .limit(1);

      if (!provider) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: JSON.stringify({
            message: 'Service provider not found.',
            messageAr: 'مزود الخدمة غير موجود.',
            code: 'PROVIDER_NOT_FOUND',
          }),
        });
      }

      // Check if link already exists
      const [existingLink] = await ctx.db
        .select()
        .from(providerOfficeLinks)
        .where(
          and(
            eq(providerOfficeLinks.providerId, input.providerId),
            eq(providerOfficeLinks.officeId, input.officeId),
          ),
        )
        .limit(1);

      if (existingLink) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: JSON.stringify({
            message: 'Provider is already linked to this office.',
            messageAr: 'مزود الخدمة مرتبط بالفعل بهذا المكتب.',
            code: 'PROVIDER_ALREADY_LINKED',
          }),
        });
      }

      await ctx.db.insert(providerOfficeLinks).values({
        providerId: input.providerId,
        officeId: input.officeId,
        status: 'active',
      });

      return { success: true };
    }),

  updateStatus: officeProcedure
    .input(
      z.object({
        providerId: z.string().uuid(),
        officeId: z.string().uuid(),
        status: z.enum(['active', 'inactive', 'blocked']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [link] = await ctx.db
        .select()
        .from(providerOfficeLinks)
        .where(
          and(
            eq(providerOfficeLinks.providerId, input.providerId),
            eq(providerOfficeLinks.officeId, input.officeId),
          ),
        )
        .limit(1);

      if (!link) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: JSON.stringify({
            message: 'Provider-office link not found.',
            messageAr: 'رابط مزود الخدمة والمكتب غير موجود.',
            code: 'LINK_NOT_FOUND',
          }),
        });
      }

      await ctx.db
        .update(providerOfficeLinks)
        .set({ status: input.status })
        .where(eq(providerOfficeLinks.id, link.id));

      return { success: true };
    }),
});
