import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and, count, sql } from 'drizzle-orm';
import { router, officeProcedure } from '../trpc';
import { buildings, units, users, subscriptions, subscriptionPlans } from '@faseel/db';

export const buildingsRouter = router({
  list: officeProcedure
    .input(
      z.object({
        officeId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          id: buildings.id,
          nameAr: buildings.nameAr,
          nameEn: buildings.nameEn,
          address: buildings.address,
          city: buildings.city,
          district: buildings.district,
          type: buildings.type,
          totalUnits: buildings.totalUnits,
          floors: buildings.floors,
          imageUrl: buildings.imageUrl,
          createdAt: buildings.createdAt,
          unitCount:
            sql<number>`(SELECT count(*) FROM units WHERE units.building_id = ${buildings.id})`.as(
              'unit_count',
            ),
        })
        .from(buildings)
        .where(eq(buildings.officeId, input.officeId));

      return rows;
    }),

  getById: officeProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [building] = await ctx.db
        .select()
        .from(buildings)
        .where(eq(buildings.id, input.id))
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

      // Verify office ownership
      if (building.officeId !== ctx.user.officeId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: JSON.stringify({
            message: 'You do not have access to this building.',
            messageAr: 'ليس لديك صلاحية الوصول لهذا المبنى.',
            code: 'BUILDING_ACCESS_DENIED',
          }),
        });
      }

      // Get units
      const buildingUnits = await ctx.db
        .select()
        .from(units)
        .where(eq(units.buildingId, building.id));

      // Get owner info if exists
      let owner = null;
      if (building.ownerId) {
        const [ownerRow] = await ctx.db
          .select({
            id: users.id,
            nameAr: users.nameAr,
            nameEn: users.nameEn,
            phone: users.phone,
          })
          .from(users)
          .where(eq(users.id, building.ownerId))
          .limit(1);
        owner = ownerRow ?? null;
      }

      return {
        ...building,
        units: buildingUnits,
        owner,
      };
    }),

  create: officeProcedure
    .input(
      z.object({
        officeId: z.string().uuid(),
        name: z.string().min(1).max(255),
        nameEn: z.string().max(255).optional(),
        address: z.string().min(1),
        city: z.string().min(1),
        district: z.string().min(1),
        type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'MIXED']).default('RESIDENTIAL'),
        totalUnits: z.number().int().min(1).default(1),
        floors: z.number().int().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate subscription limits
      await checkBuildingLimit(ctx.db, input.officeId);

      const [building] = await ctx.db
        .insert(buildings)
        .values({
          officeId: input.officeId,
          nameAr: input.name,
          nameEn: input.nameEn,
          address: input.address,
          city: input.city,
          district: input.district,
          type: input.type,
          totalUnits: input.totalUnits,
          floors: input.floors,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
        })
        .returning();

      return { id: building!.id };
    }),

  update: officeProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        nameEn: z.string().max(255).optional(),
        address: z.string().min(1).optional(),
        city: z.string().min(1).optional(),
        district: z.string().min(1).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateFields } = input;

      // Verify ownership
      const [building] = await ctx.db.select().from(buildings).where(eq(buildings.id, id)).limit(1);

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

      if (building.officeId !== ctx.user.officeId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: JSON.stringify({
            message: 'You do not have access to this building.',
            messageAr: 'ليس لديك صلاحية الوصول لهذا المبنى.',
            code: 'BUILDING_ACCESS_DENIED',
          }),
        });
      }

      const setObj: Record<string, unknown> = {};
      if (updateFields.name) setObj.nameAr = updateFields.name;
      if (updateFields.nameEn) setObj.nameEn = updateFields.nameEn;
      if (updateFields.address) setObj.address = updateFields.address;
      if (updateFields.city) setObj.city = updateFields.city;
      if (updateFields.district) setObj.district = updateFields.district;
      if (updateFields.latitude !== undefined) setObj.latitude = updateFields.latitude.toString();
      if (updateFields.longitude !== undefined)
        setObj.longitude = updateFields.longitude.toString();

      if (Object.keys(setObj).length > 0) {
        await ctx.db.update(buildings).set(setObj).where(eq(buildings.id, id));
      }

      return { success: true };
    }),

  delete: officeProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [building] = await ctx.db
        .select()
        .from(buildings)
        .where(eq(buildings.id, input.id))
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

      if (building.officeId !== ctx.user.officeId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: JSON.stringify({
            message: 'You do not have access to this building.',
            messageAr: 'ليس لديك صلاحية الوصول لهذا المبنى.',
            code: 'BUILDING_ACCESS_DENIED',
          }),
        });
      }

      // Cascade delete: units are deleted via FK cascade
      await ctx.db.delete(buildings).where(eq(buildings.id, input.id));

      return { success: true };
    }),

  listUnits: officeProcedure
    .input(
      z.object({
        buildingId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify building belongs to office
      const [building] = await ctx.db
        .select()
        .from(buildings)
        .where(eq(buildings.id, input.buildingId))
        .limit(1);

      if (!building || building.officeId !== ctx.user.officeId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: JSON.stringify({
            message: 'You do not have access to this building.',
            messageAr: 'ليس لديك صلاحية الوصول لهذا المبنى.',
            code: 'BUILDING_ACCESS_DENIED',
          }),
        });
      }

      const rows = await ctx.db
        .select({
          id: units.id,
          unitNumber: units.unitNumber,
          floor: units.floor,
          bedrooms: units.bedrooms,
          bathrooms: units.bathrooms,
          areaSqm: units.areaSqm,
          monthlyRent: units.monthlyRent,
          status: units.status,
          tenantId: units.tenantId,
          tenantName: users.nameAr,
          tenantPhone: users.phone,
        })
        .from(units)
        .leftJoin(users, eq(units.tenantId, users.id))
        .where(eq(units.buildingId, input.buildingId));

      return rows;
    }),

  createUnit: officeProcedure
    .input(
      z.object({
        buildingId: z.string().uuid(),
        unitNumber: z.string().min(1),
        floor: z.number().int(),
        bedrooms: z.number().int().min(0),
        bathrooms: z.number().int().min(0),
        areaSqm: z.number().positive().optional(),
        monthlyRent: z.number().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify building belongs to office
      const [building] = await ctx.db
        .select()
        .from(buildings)
        .where(eq(buildings.id, input.buildingId))
        .limit(1);

      if (!building || building.officeId !== ctx.user.officeId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: JSON.stringify({
            message: 'You do not have access to this building.',
            messageAr: 'ليس لديك صلاحية الوصول لهذا المبنى.',
            code: 'BUILDING_ACCESS_DENIED',
          }),
        });
      }

      // Validate subscription unit limits
      await checkUnitLimit(ctx.db, building.officeId);

      const [unit] = await ctx.db
        .insert(units)
        .values({
          buildingId: input.buildingId,
          unitNumber: input.unitNumber,
          floor: input.floor,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          areaSqm: input.areaSqm?.toString(),
          monthlyRent: input.monthlyRent,
        })
        .returning();

      return { id: unit!.id };
    }),

  updateUnit: officeProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        unitNumber: z.string().min(1).optional(),
        floor: z.number().int().optional(),
        bedrooms: z.number().int().min(0).optional(),
        bathrooms: z.number().int().min(0).optional(),
        areaSqm: z.number().positive().optional(),
        monthlyRent: z.number().positive().optional(),
        status: z.enum(['OCCUPIED', 'VACANT', 'MAINTENANCE']).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateFields } = input;

      // Verify ownership chain: unit -> building -> office
      const [unit] = await ctx.db.select().from(units).where(eq(units.id, id)).limit(1);

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

      if (!building || building.officeId !== ctx.user.officeId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: JSON.stringify({
            message: 'You do not have access to this unit.',
            messageAr: 'ليس لديك صلاحية الوصول لهذه الوحدة.',
            code: 'UNIT_ACCESS_DENIED',
          }),
        });
      }

      const setObj: Record<string, unknown> = {};
      if (updateFields.unitNumber) setObj.unitNumber = updateFields.unitNumber;
      if (updateFields.floor !== undefined) setObj.floor = updateFields.floor;
      if (updateFields.bedrooms !== undefined) setObj.bedrooms = updateFields.bedrooms;
      if (updateFields.bathrooms !== undefined) setObj.bathrooms = updateFields.bathrooms;
      if (updateFields.areaSqm !== undefined) setObj.areaSqm = updateFields.areaSqm.toString();
      if (updateFields.monthlyRent !== undefined) setObj.monthlyRent = updateFields.monthlyRent;
      if (updateFields.status) setObj.status = updateFields.status;

      if (Object.keys(setObj).length > 0) {
        await ctx.db.update(units).set(setObj).where(eq(units.id, id));
      }

      return { success: true };
    }),
});

async function checkBuildingLimit(db: unknown, officeId: string): Promise<void> {
  const typedDb = db as import('@faseel/db').Database;

  const [activeSub] = await typedDb
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.officeId, officeId), eq(subscriptions.status, 'ACTIVE')))
    .limit(1);

  if (!activeSub) return; // No subscription, no limit enforcement (free tier / trial)

  const [plan] = await typedDb
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, activeSub.planId))
    .limit(1);

  if (!plan?.maxBuildings) return; // Unlimited

  const buildingCountRows = await typedDb
    .select({ value: count() })
    .from(buildings)
    .where(eq(buildings.officeId, officeId));

  const currentCount = buildingCountRows[0]?.value ?? 0;

  if (currentCount >= plan.maxBuildings) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: JSON.stringify({
        message: `Building limit reached (${plan.maxBuildings}). Upgrade your plan to add more.`,
        messageAr: `تم الوصول للحد الأقصى من المباني (${plan.maxBuildings}). قم بترقية خطتك لإضافة المزيد.`,
        code: 'BUILDING_LIMIT_REACHED',
      }),
    });
  }
}

async function checkUnitLimit(db: unknown, officeId: string): Promise<void> {
  const typedDb = db as import('@faseel/db').Database;

  const [activeSub] = await typedDb
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.officeId, officeId), eq(subscriptions.status, 'ACTIVE')))
    .limit(1);

  if (!activeSub) return;

  const [plan] = await typedDb
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, activeSub.planId))
    .limit(1);

  if (!plan?.maxUnits) return;

  const unitCountRows = await typedDb
    .select({ value: count() })
    .from(units)
    .innerJoin(buildings, eq(units.buildingId, buildings.id))
    .where(eq(buildings.officeId, officeId));

  const currentUnitCount = unitCountRows[0]?.value ?? 0;

  if (currentUnitCount >= plan.maxUnits) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: JSON.stringify({
        message: `Unit limit reached (${plan.maxUnits}). Upgrade your plan to add more.`,
        messageAr: `تم الوصول للحد الأقصى من الوحدات (${plan.maxUnits}). قم بترقية خطتك لإضافة المزيد.`,
        code: 'UNIT_LIMIT_REACHED',
      }),
    });
  }
}
