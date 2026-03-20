import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import {
  users,
  userRoles,
  offices,
  serviceProviders,
  subscriptions,
  subscriptionPlans,
} from '@faseel/db';
import { generateAccessToken } from '../services/jwt';

/**
 * Auto-create a 30-day trial subscription when a new OFFICE_ADMIN signs up.
 */
async function ensureTrialForOffice(db: import('@faseel/db').Database, officeId: string) {
  const [existingSub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.officeId, officeId))
    .limit(1);

  if (existingSub) return;

  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(and(eq(subscriptionPlans.isActive, true), eq(subscriptionPlans.roleType, 'office')))
    .limit(1);

  let planId: string;

  if (plan) {
    planId = plan.id;
  } else {
    const [newPlan] = await db
      .insert(subscriptionPlans)
      .values({
        nameAr: 'تجريبي',
        nameEn: 'Trial',
        roleType: 'office',
        maxBuildings: 5,
        maxUnits: 75,
        maxAdmins: 3,
        priceSar: 0,
        isActive: true,
      })
      .returning();
    planId = newPlan!.id;
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  await db.insert(subscriptions).values({
    officeId,
    planId,
    stripeSubscriptionId: null,
    status: 'ACTIVE',
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
  });
}

function mapRoleToSession(dbRole: string): 'tenant' | 'office' | 'provider' | 'owner' {
  switch (dbRole) {
    case 'OFFICE_ADMIN':
      return 'office';
    case 'OWNER':
      return 'owner';
    case 'TENANT':
      return 'tenant';
    case 'SERVICE_PROVIDER':
      return 'provider';
    default:
      return 'tenant';
  }
}

export const profileRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);

    if (!user) {
      return null;
    }

    const roles = await ctx.db.select().from(userRoles).where(eq(userRoles.userId, ctx.user.id));

    // Enrich with office names
    const enrichedRoles: Array<{
      role: string;
      officeId: string | null;
      officeName: string | null;
    }> = [];

    for (const r of roles) {
      let officeName: string | null = null;
      if (r.officeId) {
        const [office] = await ctx.db
          .select({ nameAr: offices.nameAr })
          .from(offices)
          .where(eq(offices.id, r.officeId))
          .limit(1);
        officeName = office?.nameAr ?? null;
      }
      enrichedRoles.push({
        role: r.role,
        officeId: r.officeId,
        officeName,
      });
    }

    return {
      id: user.id,
      phone: user.phone,
      nameAr: user.nameAr,
      nameEn: user.nameEn,
      email: user.email,
      avatarUrl: user.avatarUrl,
      roles: enrichedRoles,
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

  completeOnboardingWithRoles: protectedProcedure
    .input(
      z.object({
        nameAr: z.string().min(2).max(255),
        nameEn: z.string().max(255).optional(),
        email: z.string().email().optional().or(z.literal('')),
        roles: z.array(z.enum(['TENANT', 'OFFICE_ADMIN', 'OWNER', 'SERVICE_PROVIDER'])).min(1),
        officeData: z
          .object({
            nameAr: z.string().min(3),
            city: z.string(),
            crNumber: z.string().optional(),
            phone: z.string().optional(),
          })
          .optional(),
        providerData: z
          .object({
            specialties: z.array(z.string()).min(1),
            bio: z.string().max(500).optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Validate: OFFICE_ADMIN requires officeData
      if (input.roles.includes('OFFICE_ADMIN') && !input.officeData) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: JSON.stringify({
            message: 'Office data is required when selecting Office Admin role.',
            messageAr: 'بيانات المكتب مطلوبة عند اختيار دور مدير المكتب.',
            code: 'OFFICE_DATA_REQUIRED',
          }),
        });
      }

      // Validate: SERVICE_PROVIDER requires providerData
      if (input.roles.includes('SERVICE_PROVIDER') && !input.providerData) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: JSON.stringify({
            message: 'Provider data is required when selecting Service Provider role.',
            messageAr: 'بيانات مقدم الخدمة مطلوبة عند اختيار دور مقدم الخدمة.',
            code: 'PROVIDER_DATA_REQUIRED',
          }),
        });
      }

      // Run everything in a transaction
      const result = await ctx.db.transaction(async (tx) => {
        // 1. Update user profile
        const profileUpdate: Record<string, unknown> = {
          nameAr: input.nameAr,
        };
        if (input.nameEn) profileUpdate.nameEn = input.nameEn;
        if (input.email) profileUpdate.email = input.email;

        await tx.update(users).set(profileUpdate).where(eq(users.id, userId));

        // 2. Delete any existing auto-assigned roles (clean slate)
        await tx.delete(userRoles).where(eq(userRoles.userId, userId));

        // 3. Create roles and associated records
        let newOfficeId: string | null = null;

        for (const role of input.roles) {
          if (role === 'OFFICE_ADMIN' && input.officeData) {
            // Create office record
            const [newOffice] = await tx
              .insert(offices)
              .values({
                nameAr: input.officeData.nameAr,
                city: input.officeData.city,
                crNumber: input.officeData.crNumber ?? null,
                phone: input.officeData.phone ?? null,
              })
              .returning();

            newOfficeId = newOffice!.id;

            await tx.insert(userRoles).values({
              userId,
              role: 'OFFICE_ADMIN',
              officeId: newOfficeId,
            });
          } else if (role === 'SERVICE_PROVIDER' && input.providerData) {
            // Create service provider record
            await tx.insert(serviceProviders).values({
              userId,
              specialties: input.providerData.specialties,
              bio: input.providerData.bio ?? null,
            });

            await tx.insert(userRoles).values({
              userId,
              role: 'SERVICE_PROVIDER',
            });
          } else {
            // TENANT or OWNER: just insert the role
            await tx.insert(userRoles).values({
              userId,
              role,
            });
          }
        }

        // 4. Fetch updated roles
        const updatedRoles = await tx.select().from(userRoles).where(eq(userRoles.userId, userId));

        // 5. Enrich with office names
        const enrichedRoles: Array<{
          role: string;
          officeId: string | null;
          officeName: string | null;
        }> = [];

        for (const r of updatedRoles) {
          let officeName: string | null = null;
          if (r.officeId) {
            const [office] = await tx
              .select({ nameAr: offices.nameAr })
              .from(offices)
              .where(eq(offices.id, r.officeId))
              .limit(1);
            officeName = office?.nameAr ?? null;
          }
          enrichedRoles.push({
            role: r.role,
            officeId: r.officeId,
            officeName,
          });
        }

        // 6. Re-fetch user
        const [updatedUser] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);

        // 7. If OFFICE_ADMIN was selected, create trial subscription
        if (newOfficeId) {
          await ensureTrialForOffice(tx as import('@faseel/db').Database, newOfficeId);
        }

        return { updatedUser: updatedUser!, enrichedRoles };
      });

      // 8. Generate access token with primary role
      const primaryRole = result.enrichedRoles[0]!;
      const accessToken = generateAccessToken({
        userId,
        role: mapRoleToSession(primaryRole.role),
        officeId: primaryRole.officeId ?? undefined,
      });

      return {
        user: {
          id: result.updatedUser.id,
          phone: result.updatedUser.phone,
          nameAr: result.updatedUser.nameAr,
          nameEn: result.updatedUser.nameEn,
        },
        roles: result.enrichedRoles,
        accessToken,
      };
    }),

  addRole: protectedProcedure
    .input(
      z.object({
        role: z.enum(['TENANT', 'OFFICE_ADMIN', 'OWNER', 'SERVICE_PROVIDER']),
        officeData: z
          .object({
            nameAr: z.string().min(3),
            city: z.string(),
            crNumber: z.string().optional(),
          })
          .optional(),
        providerData: z
          .object({
            specialties: z.array(z.string()).min(1),
            bio: z.string().max(500).optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // 1. Check user doesn't already have this role
      const [existing] = await ctx.db
        .select()
        .from(userRoles)
        .where(and(eq(userRoles.userId, userId), eq(userRoles.role, input.role)))
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: JSON.stringify({
            message: 'You already have this role.',
            messageAr: 'لديك هذا الدور بالفعل.',
            code: 'ROLE_ALREADY_EXISTS',
          }),
        });
      }

      // Validate required data
      if (input.role === 'OFFICE_ADMIN' && !input.officeData) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: JSON.stringify({
            message: 'Office data is required for Office Admin role.',
            messageAr: 'بيانات المكتب مطلوبة لدور مدير المكتب.',
            code: 'OFFICE_DATA_REQUIRED',
          }),
        });
      }

      if (input.role === 'SERVICE_PROVIDER' && !input.providerData) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: JSON.stringify({
            message: 'Provider data is required for Service Provider role.',
            messageAr: 'بيانات مقدم الخدمة مطلوبة لدور مقدم الخدمة.',
            code: 'PROVIDER_DATA_REQUIRED',
          }),
        });
      }

      // 2. Create role and associated records in transaction
      await ctx.db.transaction(async (tx) => {
        if (input.role === 'OFFICE_ADMIN' && input.officeData) {
          const [newOffice] = await tx
            .insert(offices)
            .values({
              nameAr: input.officeData.nameAr,
              city: input.officeData.city,
              crNumber: input.officeData.crNumber ?? null,
            })
            .returning();

          await tx.insert(userRoles).values({
            userId,
            role: 'OFFICE_ADMIN',
            officeId: newOffice!.id,
          });

          // Create trial subscription
          await ensureTrialForOffice(tx as import('@faseel/db').Database, newOffice!.id);
        } else if (input.role === 'SERVICE_PROVIDER' && input.providerData) {
          // Check if provider profile already exists
          const [existingProvider] = await tx
            .select()
            .from(serviceProviders)
            .where(eq(serviceProviders.userId, userId))
            .limit(1);

          if (!existingProvider) {
            await tx.insert(serviceProviders).values({
              userId,
              specialties: input.providerData.specialties,
              bio: input.providerData.bio ?? null,
            });
          }

          await tx.insert(userRoles).values({
            userId,
            role: 'SERVICE_PROVIDER',
          });
        } else {
          // TENANT or OWNER
          await tx.insert(userRoles).values({
            userId,
            role: input.role,
          });
        }
      });

      // 3. Fetch and return updated roles
      const updatedRoles = await ctx.db
        .select()
        .from(userRoles)
        .where(eq(userRoles.userId, userId));

      const enrichedRoles: Array<{
        role: string;
        officeId: string | null;
        officeName: string | null;
      }> = [];

      for (const r of updatedRoles) {
        let officeName: string | null = null;
        if (r.officeId) {
          const [office] = await ctx.db
            .select({ nameAr: offices.nameAr })
            .from(offices)
            .where(eq(offices.id, r.officeId))
            .limit(1);
          officeName = office?.nameAr ?? null;
        }
        enrichedRoles.push({
          role: r.role,
          officeId: r.officeId,
          officeName,
        });
      }

      return { roles: enrichedRoles };
    }),
});
