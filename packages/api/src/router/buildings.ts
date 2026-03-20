import { z } from 'zod';
import { router, officeProcedure } from '../trpc';

export const buildingsRouter = router({
  /**
   * List all buildings for an office.
   */
  list: officeProcedure
    .input(
      z.object({
        officeId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Query buildings table filtered by officeId
      void ctx.db;
      void input;
      return [] as Array<{
        id: string;
        name: string;
        address: string;
        unitCount: number;
      }>;
    }),

  /**
   * Get a single building by ID.
   */
  getById: officeProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Query building by ID, verify office ownership
      void ctx.db;
      void input;
      return null as {
        id: string;
        name: string;
        address: string;
        city: string;
        district: string;
        unitCount: number;
      } | null;
    }),

  /**
   * Create a new building.
   */
  create: officeProcedure
    .input(
      z.object({
        officeId: z.string().uuid(),
        name: z.string().min(1).max(255),
        address: z.string().min(1),
        city: z.string().min(1),
        district: z.string().min(1),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Insert building record, link to office
      void ctx.db;
      void input;
      return { id: '' };
    }),

  /**
   * Update a building.
   */
  update: officeProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        address: z.string().min(1).optional(),
        city: z.string().min(1).optional(),
        district: z.string().min(1).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Update building record, verify office ownership
      void ctx.db;
      void input;
      return { success: true };
    }),

  /**
   * Soft-delete a building.
   */
  delete: officeProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Soft-delete building, verify no active leases
      void ctx.db;
      void input;
      return { success: true };
    }),

  /**
   * List units within a building.
   */
  listUnits: officeProcedure
    .input(
      z.object({
        buildingId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Query units table filtered by buildingId
      void ctx.db;
      void input;
      return [] as Array<{
        id: string;
        unitNumber: string;
        floor: number;
        bedrooms: number;
        status: string;
      }>;
    }),

  /**
   * Create a unit within a building.
   */
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
      // TODO: Insert unit record, link to building
      void ctx.db;
      void input;
      return { id: '' };
    }),

  /**
   * Update a unit.
   */
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
        status: z.enum(['available', 'occupied', 'maintenance']).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Update unit record, verify ownership chain
      void ctx.db;
      void input;
      return { success: true };
    }),
});
