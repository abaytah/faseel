import { router } from '../trpc';
import { authRouter } from './auth';
import { buildingsRouter } from './buildings';
import { maintenanceRouter } from './maintenance';
import { providersRouter } from './providers';
import { subscriptionsRouter } from './subscriptions';
import { notificationsRouter } from './notifications';
import { announcementsRouter } from './announcements';
import { uploadsRouter } from './uploads';
import { healthRouter } from './health';

export const appRouter = router({
  auth: authRouter,
  buildings: buildingsRouter,
  maintenance: maintenanceRouter,
  providers: providersRouter,
  subscriptions: subscriptionsRouter,
  notifications: notificationsRouter,
  announcements: announcementsRouter,
  uploads: uploadsRouter,
  health: healthRouter,
});

export type AppRouter = typeof appRouter;
