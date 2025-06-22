import type { Context } from 'hono';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { useDrizzle } from '@/db';
import { sessions } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { withNotDeleted, softDelete } from '@/utils';
import dayjs from 'dayjs';
import { LogoutSuccessPage } from '@/components/LogoutSuccessPage';

type Variables = {
  userId: number;
};

export const logoutRoute = new Hono<{ Variables: Variables }>();

const authMiddleware = async (c: Context, next: any) => {
  const db = useDrizzle(c);
  const sessionId = getCookie(c, 'sessionId');
  logger.info(`authMiddleware ${sessionId}`);

  if (!sessionId) {
    return c.redirect('/account/login');
  }

  const session = await db?.query.sessions.findFirst({
    where: withNotDeleted(sessions, eq(sessions.id, sessionId)),
  });
  logger.info(JSON.stringify(session, null, 2));

  if (!session || dayjs(session.expiresAt).isBefore(dayjs())) {
    return c.redirect('/account/login');
  }

  c.set('userId', session.userId);
  await next();
};

logoutRoute.use('/*', authMiddleware);

logoutRoute.get('/', async (c) => {
  const db = useDrizzle(c);
  const sessionId = getCookie(c, 'sessionId');

  if (sessionId) {
    try {
      logger.info(`Soft deleting session: ${sessionId}`);
      await db?.update(sessions)
        .set(softDelete())
        .where(eq(sessions.id, sessionId));
      logger.info(`Session ${sessionId} soft deleted successfully`);
    } catch (e) {
      logger.error(`Failed to soft delete session: ${e}`);
    }
  }

  // Clear sessionId cookie
  setCookie(c, 'sessionId', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  logger.info('User logged out successfully, showing success page');
  return c.html(
    <LogoutSuccessPage title="Logout Successful" />
  );
});

logoutRoute.post('/', async (c) => {
  const db = useDrizzle(c);
  const sessionId = getCookie(c, 'sessionId');

  if (sessionId) {
    try {
      logger.info(`Soft deleting session: ${sessionId}`);
      await db?.update(sessions)
        .set(softDelete())
        .where(eq(sessions.id, sessionId));
      logger.info(`Session ${sessionId} soft deleted successfully`);
    } catch (e) {
      logger.error(`Failed to soft delete session: ${e}`);
    }
  }

  // Clear sessionId cookie
  setCookie(c, 'sessionId', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  logger.info('User logged out successfully, showing success page');
  return c.html(
    <LogoutSuccessPage title="Logout Successful" />
  );
});
