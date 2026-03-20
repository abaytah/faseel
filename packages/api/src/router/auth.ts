import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const authRouter = router({
  /**
   * Send OTP to phone number for login/registration.
   */
  sendOtp: publicProcedure
    .input(
      z.object({
        phone: z.string().min(10).max(15),
      }),
    )
    .mutation(async ({ input }) => {
      // TODO: Generate OTP, store in Redis with TTL, send via SMS provider
      const { phone } = input;
      void phone;
      return { success: true };
    }),

  /**
   * Verify OTP and return JWT tokens.
   */
  verifyOtp: publicProcedure
    .input(
      z.object({
        phone: z.string().min(10).max(15),
        code: z.string().length(6),
      }),
    )
    .mutation(async ({ input }) => {
      // TODO: Validate OTP from Redis, find/create user, generate JWT pair
      const { phone, code } = input;
      void phone;
      void code;
      return {
        accessToken: '',
        refreshToken: '',
        user: {
          id: '',
          phone: input.phone,
          role: 'tenant' as const,
        },
      };
    }),

  /**
   * Refresh access token using a valid refresh token.
   */
  refreshToken: publicProcedure
    .input(
      z.object({
        refreshToken: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // TODO: Verify refresh token, check revocation list, issue new pair
      void input.refreshToken;
      return {
        accessToken: '',
        refreshToken: '',
      };
    }),

  /**
   * Switch the active role for the current session (e.g. tenant <-> office).
   */
  switchRole: protectedProcedure
    .input(
      z.object({
        role: z.enum(['tenant', 'office', 'provider', 'owner']),
        officeId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Validate role assignment, generate new token with updated role claim
      void ctx.user;
      void input;
      return {
        accessToken: '',
      };
    }),

  /**
   * Logout and revoke the current session.
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // TODO: Add current token to Redis revocation list
    void ctx.user;
    return { success: true };
  }),
});
