import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { filterResources } from '../data/resources';

export const resourcesRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          category: z.enum(['government', 'tools', 'providers']).optional(),
          role: z.enum(['office', 'tenant', 'owner', 'provider']).optional(),
        })
        .optional(),
    )
    .query(({ input }) => {
      return filterResources(input ?? undefined);
    }),
});
