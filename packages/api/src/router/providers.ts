import { z } from 'zod';
import { router, protectedProcedure, officeProcedure } from '../trpc';

export const providersRouter = router({
  /**
   * List providers linked to an office.
   */
  list: officeProcedure
    .input(
      z.object({
        officeId: z.string().uuid(),
        category: z.string().optional(),
        status: z.enum(['active', 'inactive']).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Query providers linked to office, optionally filter by category/status
      void ctx.db;
      void input;
      return [] as Array<{
        id: string;
        name: string;
        category: string;
        rating: number;
        status: string;
      }>;
    }),

  /**
   * Get a provider's profile by ID.
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Fetch provider profile, verify access
      void ctx.db;
      void input;
      return null;
    }),

  /**
   * Link an existing provider to an office.
   */
  linkToOffice: officeProcedure
    .input(
      z.object({
        providerId: z.string().uuid(),
        officeId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Create office-provider link, verify provider exists
      void ctx.db;
      void input;
      return { success: true };
    }),

  /**
   * Update a provider's status within an office.
   */
  updateStatus: officeProcedure
    .input(
      z.object({
        providerId: z.string().uuid(),
        officeId: z.string().uuid(),
        status: z.enum(['active', 'inactive']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Update provider status for the given office
      void ctx.db;
      void input;
      return { success: true };
    }),
});
