import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const middleware = t.middleware;

/**
 * Public procedure - no auth required.
 */
export const publicProcedure = t.procedure;

/**
 * Middleware that enforces a valid user session.
 */
const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Protected procedure - requires authenticated user.
 */
export const protectedProcedure = t.procedure.use(isAuthed);

/**
 * Middleware that enforces office role on the authenticated user.
 */
const hasOfficeRole = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  if (ctx.user.role !== 'office') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This action requires an office role',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Office procedure - requires authenticated user with office role.
 */
export const officeProcedure = t.procedure.use(hasOfficeRole);
