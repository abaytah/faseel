import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { router, protectedProcedure, officeProcedure } from '../trpc';
import {
  maintenanceRequests,
  requestAttachments,
  statusLog,
  buildings,
  units,
  users,
  serviceProviders,
} from '@faseel/db';
import { STATUS_TRANSITIONS, type RequestStatusType } from '@faseel/shared';

export const maintenanceRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(['SUBMITTED', 'REVIEWED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
          .optional(),
        buildingId: z.string().uuid().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const offset = (input.page - 1) * input.limit;

      const conditions: ReturnType<typeof eq>[] = [];

      // Role-based filtering
      if (user.role === 'tenant') {
        conditions.push(eq(maintenanceRequests.tenantId, user.id));
      } else if (user.role === 'office' && user.officeId) {
        conditions.push(eq(maintenanceRequests.officeId, user.officeId));
      } else if (user.role === 'provider') {
        conditions.push(eq(maintenanceRequests.assignedProviderId, user.id));
      }

      if (input.status) {
        conditions.push(eq(maintenanceRequests.status, input.status));
      }

      if (input.buildingId) {
        conditions.push(eq(maintenanceRequests.buildingId, input.buildingId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await ctx.db
        .select({
          id: maintenanceRequests.id,
          titleAr: maintenanceRequests.titleAr,
          titleEn: maintenanceRequests.titleEn,
          status: maintenanceRequests.status,
          priority: maintenanceRequests.priority,
          category: maintenanceRequests.category,
          createdAt: maintenanceRequests.createdAt,
          buildingId: maintenanceRequests.buildingId,
          unitId: maintenanceRequests.unitId,
        })
        .from(maintenanceRequests)
        .where(whereClause)
        .orderBy(desc(maintenanceRequests.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [totalRow] = await ctx.db
        .select({ value: count() })
        .from(maintenanceRequests)
        .where(whereClause);

      return {
        items,
        total: totalRow?.value ?? 0,
      };
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [request] = await ctx.db
        .select()
        .from(maintenanceRequests)
        .where(eq(maintenanceRequests.id, input.id))
        .limit(1);

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: JSON.stringify({
            message: 'Maintenance request not found.',
            messageAr: 'طلب الصيانة غير موجود.',
            code: 'REQUEST_NOT_FOUND',
          }),
        });
      }

      // Access check
      const { user } = ctx;
      if (
        (user.role === 'tenant' && request.tenantId !== user.id) ||
        (user.role === 'office' && request.officeId !== user.officeId) ||
        (user.role === 'provider' && request.assignedProviderId !== user.id)
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: JSON.stringify({
            message: 'You do not have access to this request.',
            messageAr: 'ليس لديك صلاحية الوصول لهذا الطلب.',
            code: 'REQUEST_ACCESS_DENIED',
          }),
        });
      }

      // Get attachments
      const attachments = await ctx.db
        .select()
        .from(requestAttachments)
        .where(eq(requestAttachments.requestId, request.id));

      // Get status log
      const logs = await ctx.db
        .select()
        .from(statusLog)
        .where(eq(statusLog.requestId, request.id))
        .orderBy(desc(statusLog.createdAt));

      // Get tenant info
      const [tenant] = await ctx.db
        .select({ id: users.id, nameAr: users.nameAr, nameEn: users.nameEn, phone: users.phone })
        .from(users)
        .where(eq(users.id, request.tenantId))
        .limit(1);

      // Get provider info if assigned
      let provider = null;
      if (request.assignedProviderId) {
        const [providerUser] = await ctx.db
          .select({ id: users.id, nameAr: users.nameAr, nameEn: users.nameEn, phone: users.phone })
          .from(users)
          .where(eq(users.id, request.assignedProviderId))
          .limit(1);
        provider = providerUser ?? null;
      }

      return {
        ...request,
        attachments,
        statusLog: logs,
        tenant: tenant ?? null,
        provider,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        unitId: z.string().uuid(),
        title: z.string().min(1).max(255),
        titleEn: z.string().max(255).optional(),
        description: z.string().min(1).max(2000),
        descriptionEn: z.string().max(2000).optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
        category: z.enum([
          'PLUMBING',
          'ELECTRICAL',
          'HVAC',
          'STRUCTURAL',
          'APPLIANCE',
          'COSMETIC',
          'PAINTING',
          'CARPENTRY',
          'PEST_CONTROL',
          'ELEVATOR',
          'SECURITY',
          'CLEANING',
          'OTHER',
        ]),
        attachmentUrls: z.array(z.string().url()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get unit -> building -> office chain
      const [unit] = await ctx.db.select().from(units).where(eq(units.id, input.unitId)).limit(1);

      if (!unit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: JSON.stringify({
            message: 'Unit not found.',
            messageAr: 'الوحدة غير موجودة.',
            code: 'UNIT_NOT_FOUND',
          }),
        });
      }

      const [building] = await ctx.db
        .select()
        .from(buildings)
        .where(eq(buildings.id, unit.buildingId))
        .limit(1);

      if (!building) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: JSON.stringify({
            message: 'Building not found.',
            messageAr: 'المبنى غير موجود.',
            code: 'BUILDING_NOT_FOUND',
          }),
        });
      }

      // Create the request in a transaction
      const result = await ctx.db.transaction(async (tx) => {
        const [request] = await tx
          .insert(maintenanceRequests)
          .values({
            officeId: building.officeId,
            buildingId: building.id,
            unitId: input.unitId,
            tenantId: ctx.user.id,
            category: input.category,
            priority: input.priority,
            titleAr: input.title,
            titleEn: input.titleEn,
            descriptionAr: input.description,
            descriptionEn: input.descriptionEn,
          })
          .returning();

        // Add initial status log
        await tx.insert(statusLog).values({
          requestId: request!.id,
          toStatus: 'SUBMITTED',
          changedBy: ctx.user.id,
          note: 'Request submitted',
        });

        // Add attachments
        if (input.attachmentUrls?.length) {
          await tx.insert(requestAttachments).values(
            input.attachmentUrls.map((url) => ({
              requestId: request!.id,
              url,
              type: 'IMAGE' as const,
              uploadedBy: ctx.user.id,
            })),
          );
        }

        return request!;
      });

      return { id: result.id };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['REVIEWED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
        notes: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [request] = await ctx.db
        .select()
        .from(maintenanceRequests)
        .where(eq(maintenanceRequests.id, input.id))
        .limit(1);

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: JSON.stringify({
            message: 'Maintenance request not found.',
            messageAr: 'طلب الصيانة غير موجود.',
            code: 'REQUEST_NOT_FOUND',
          }),
        });
      }

      // Validate status transition
      const currentStatus = request.status as RequestStatusType;
      const allowedTransitions = STATUS_TRANSITIONS[currentStatus] ?? [];

      if (!allowedTransitions.includes(input.status as RequestStatusType)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: JSON.stringify({
            message: `Cannot transition from ${currentStatus} to ${input.status}.`,
            messageAr: `لا يمكن تغيير الحالة من ${currentStatus} إلى ${input.status}.`,
            code: 'INVALID_STATUS_TRANSITION',
          }),
        });
      }

      await ctx.db.transaction(async (tx) => {
        const updateData: Record<string, unknown> = { status: input.status };
        if (input.status === 'COMPLETED') {
          updateData.completedAt = new Date();
        }

        await tx
          .update(maintenanceRequests)
          .set(updateData)
          .where(eq(maintenanceRequests.id, input.id));

        await tx.insert(statusLog).values({
          requestId: input.id,
          fromStatus: currentStatus,
          toStatus: input.status,
          changedBy: ctx.user.id,
          note: input.notes,
        });
      });

      return { success: true };
    }),

  assignProvider: officeProcedure
    .input(
      z.object({
        requestId: z.string().uuid(),
        providerId: z.string().uuid(),
        scheduledDate: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [request] = await ctx.db
        .select()
        .from(maintenanceRequests)
        .where(eq(maintenanceRequests.id, input.requestId))
        .limit(1);

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: JSON.stringify({
            message: 'Maintenance request not found.',
            messageAr: 'طلب الصيانة غير موجود.',
            code: 'REQUEST_NOT_FOUND',
          }),
        });
      }

      if (request.officeId !== ctx.user.officeId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: JSON.stringify({
            message: 'You do not have access to this request.',
            messageAr: 'ليس لديك صلاحية الوصول لهذا الطلب.',
            code: 'REQUEST_ACCESS_DENIED',
          }),
        });
      }

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

      await ctx.db.transaction(async (tx) => {
        await tx
          .update(maintenanceRequests)
          .set({
            assignedProviderId: provider.userId,
            status: 'ASSIGNED',
            scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : undefined,
          })
          .where(eq(maintenanceRequests.id, input.requestId));

        await tx.insert(statusLog).values({
          requestId: input.requestId,
          fromStatus: request.status,
          toStatus: 'ASSIGNED',
          changedBy: ctx.user.id,
          note: `Assigned to provider ${provider.userId}`,
        });
      });

      return { success: true };
    }),

  rate: protectedProcedure
    .input(
      z.object({
        requestId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [request] = await ctx.db
        .select()
        .from(maintenanceRequests)
        .where(eq(maintenanceRequests.id, input.requestId))
        .limit(1);

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: JSON.stringify({
            message: 'Maintenance request not found.',
            messageAr: 'طلب الصيانة غير موجود.',
            code: 'REQUEST_NOT_FOUND',
          }),
        });
      }

      if (request.tenantId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: JSON.stringify({
            message: 'Only the tenant who submitted this request can rate it.',
            messageAr: 'فقط المستأجر الذي قدم هذا الطلب يمكنه تقييمه.',
            code: 'RATING_NOT_ALLOWED',
          }),
        });
      }

      if (request.status !== 'COMPLETED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: JSON.stringify({
            message: 'Can only rate completed requests.',
            messageAr: 'يمكن تقييم الطلبات المكتملة فقط.',
            code: 'REQUEST_NOT_COMPLETED',
          }),
        });
      }

      if (request.tenantRating) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: JSON.stringify({
            message: 'This request has already been rated.',
            messageAr: 'تم تقييم هذا الطلب بالفعل.',
            code: 'ALREADY_RATED',
          }),
        });
      }

      await ctx.db.transaction(async (tx) => {
        // Update request with rating
        await tx
          .update(maintenanceRequests)
          .set({
            tenantRating: input.rating,
            tenantFeedback: input.comment,
          })
          .where(eq(maintenanceRequests.id, input.requestId));

        // Update provider's average rating if assigned
        if (request.assignedProviderId) {
          const [provider] = await tx
            .select()
            .from(serviceProviders)
            .where(eq(serviceProviders.userId, request.assignedProviderId))
            .limit(1);

          if (provider) {
            const completedJobs = provider.completedJobs + 1;
            const currentRating = parseFloat(provider.rating);
            const newRating =
              (currentRating * provider.completedJobs + input.rating) / completedJobs;

            await tx
              .update(serviceProviders)
              .set({
                rating: newRating.toFixed(2),
                completedJobs,
              })
              .where(eq(serviceProviders.id, provider.id));
          }
        }
      });

      return { success: true };
    }),
});
