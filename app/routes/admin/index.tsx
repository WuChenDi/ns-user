// app/routes/admin/index.tsx
import { Hono } from 'hono';
import { serverName } from '@/config';
import { AdminLoginPage } from '@/pages/AdminLoginPage';

export const adminRoute = new Hono();

// Middleware to check session or Authorization header, skip /admin/login
adminRoute.use('/*', async (c, next) => {
  // Skip authentication for /admin/login
  const path = c.req.path;
  if (path === '/admin/login') {
    return next();
  }

  // Check Authorization header for API clients
  const adminToken = c.req.header('Authorization');
  const expectedToken = process.env.ADMIN_TOKEN || (isDebug ? 'default-admin-token' : undefined);
  if (adminToken && expectedToken && adminToken === `Bearer ${expectedToken}`) {
    return next();
  }

  // Check session for browser access
  const sessionId = c.req.header('Cookie')?.match(/session=([^;]+)/)?.[1];
  if (!sessionId) {
    logger.warn('No session ID found in request');
    return c.redirect('/admin/login');
  }

  const session = await storage.get(`session:${sessionId}`);
  if (!session || typeof session !== 'object' || !('isAdmin' in session) || !session.isAdmin) {
    logger.warn(`Invalid or unauthorized session: ${sessionId}`);
    return c.redirect('/admin/login');
  }

  await next();
});

// Admin Login Page
adminRoute.get('/login', async (c) => {
  return c.html(
    <AdminLoginPage
      title={`${serverName} - Admin Login`}
      csrfToken="csrf-placeholder"
    />
  );
});

// Handle Admin Login
adminRoute.post('/login', async (c) => {
  try {
    const body = await c.req.parseBody();
    const adminToken = body.admin_token as string;
    const expectedToken = process.env.ADMIN_TOKEN || (isDebug ? 'default-admin-token' : undefined);

    if (!expectedToken) {
      logger.error('ADMIN_TOKEN environment variable is not set');
      return c.html(
        <AdminLoginPage
          title={`${serverName} - Admin Login`}
          error="Server configuration error: ADMIN_TOKEN not set"
          csrfToken="csrf-placeholder"
        />,
        500
      );
    }

    if (adminToken !== expectedToken) {
      logger.warn('Invalid admin token provided');
      return c.html(
        <AdminLoginPage
          title={`${serverName} - Admin Login`}
          error="Invalid admin token"
          csrfToken="csrf-placeholder"
        />,
        401
      );
    }

    // Create session
    const sessionId = crypto.randomUUID();
    const session = {
      isAdmin: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (body.remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)), // 7 days or 1 day
    };
    await storage.set(`session:${sessionId}`, session);
    logger.info(`Session created: session:${sessionId}`);

    // Set session cookie
    c.res.headers.set('Set-Cookie', `session=${sessionId}; Path=/; HttpOnly; ${body.remember ? 'Max-Age=604800' : 'Max-Age=86400'}; SameSite=Strict`);

    return c.redirect('/admin');
  } catch (error) {
    logger.error('Failed to process admin login:', error);
    return c.html(
      <AdminLoginPage
        title={`${serverName} - Admin Login`}
        error="Login failed"
        csrfToken="csrf-placeholder"
      />,
      500
    );
  }
});
