import { z } from 'zod';
import { router, protectedProcedure, officeProcedure } from '../trpc';

export const maintenanceRouter = router({
  /**
   * List maintenance requests, filtered by the caller's role.
   * Tenants see their own, offices see all for their buildings, providers see assigned.
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']).optional(),
        buildingId: z.string().uuid().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Filter by role - tenant sees own, office sees office buildings, provider sees assigned
      void ctx.db;
      void input;
      return {
        items: [] as Array<{
          id: string;
          title: string;
          status: string;
          priority: string;
          createdAt: Date;
        }>,
        total: 0,
      };
    }),

  /**
   * Get a single maintenance request by ID.
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Fetch request, verify access based on role
      void ctx.db;
      void input;
      return null;
    }),

  /**
   * Create a maintenance request (tenant submits).
   */
  create: protectedProcedure
    .input(
      z.object({
        unitId: z.string().uuid(),
        title: z.string().min(1).max(255),
        description: z.string().min(1).max(2000),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
        category: z.string().min(1),
        attachmentUrls: z.array(z.string().url()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Create request, link to tenant's unit, notify office
      void ctx.db;
      void input;
      return { id: '' };
    }),

  /**
   * Update request status (office or provider).
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled']),
        notes: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Update status, validate state transitions, notify relevant parties
      void ctx.db;
      void input;
      return { success: true };
    }),

  /**
   * Assign a provider to a maintenance request.
   */
  assignProvider: officeProcedure
    .input(
      z.object({
        requestId: z.string().uuid(),
        providerId: z.string().uuid(),
        scheduledDate: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Assign provider, update status to "assigned", notify provider
      void ctx.db;
      void input;
      return { success: true };
    }),

  /**
   * Rate a completed maintenance request (tenant rates).
   */
  rate: protectedProcedure
    .input(
      z.object({
        requestId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Verify request is completed, verify tenant owns it, save rating
      void ctx.db;
      void input;
      return { success: true };
    }),
});
