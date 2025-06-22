import { Hono } from 'hono';
import { verifyPasswordFn, withNotDeleted, verifyTurnstileToken, getClientIP } from '@/utils';
import { useDrizzle } from '@/db';
import { users, sessions } from '@/database/schema';
import { nanoid } from 'nanoid';
import { eq, or } from 'drizzle-orm';
import { getCookie, setCookie } from 'hono/cookie';
import dayjs from 'dayjs';
import { LoginPage } from '@/components/LoginPage';

export const loginRoute = new Hono();

loginRoute.get('/', async (c) => {
  const sessionId = getCookie(c, 'sessionId');
  logger.info(`getCookie sessionId: ${sessionId}`);

  const success = c.req.query('success');
  const error = c.req.query('error');
  const identifier = c.req.query('identifier');
  const showRegisterLink = c.req.query('showRegisterLink') === 'true';

  return c.html(
    <LoginPage
      title="Login"
      action="/account/login"
      csrfToken="dummy-csrf-token"
      success={success ? decodeURIComponent(success) : undefined}
      error={error || undefined}
      identifier={identifier || undefined}
      showRegisterLink={showRegisterLink}
      turnstileSiteKey={process.env.TURNSTILE_SITE_KEY}
    />
  );
});

loginRoute.post('/', async (c) => {
  const db = useDrizzle(c);

  const body = await c.req.parseBody();
  const identifier = body.identifier?.toString();
  const password = body.password?.toString();
  const remember = body.remember?.toString() === '1';
  const turnstileToken = body['cf-turnstile-response']?.toString();

  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY;
  const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;

  logger.info(`Login attempt for identifier: ${identifier}, remember: ${remember}`);

  if (!identifier || !password) {
    return c.html(
      <LoginPage
        title="Login"
        action="/account/login"
        csrfToken="dummy-csrf-token"
        error="Username/Email and password are required"
        identifier={identifier || ''}
        turnstileSiteKey={turnstileSiteKey}
      />,
      400
    );
  }

  if (password.length < 6) {
    return c.html(
      <LoginPage
        title="Login"
        action="/account/login"
        csrfToken="dummy-csrf-token"
        error="Password must be at least 6 characters long"
        identifier={identifier}
        turnstileSiteKey={turnstileSiteKey}
      />,
      400
    );
  }

  if (turnstileSiteKey && turnstileSecretKey) {
    if (!turnstileToken) {
      return c.html(
        <LoginPage
          title="Login"
          action="/account/login"
          csrfToken="dummy-csrf-token"
          error="Please complete the security verification"
          identifier={identifier}
          turnstileSiteKey={turnstileSiteKey}
        />,
        400
      );
    }

    const clientIP = getClientIP(c.req.raw);
    const turnstileValid = await verifyTurnstileToken(turnstileToken, clientIP);
    
    if (!turnstileValid) {
      return c.html(
        <LoginPage
          title="Login"
          action="/account/login"
          csrfToken="dummy-csrf-token"
          error="Security verification failed. Please try again."
          identifier={identifier}
          turnstileSiteKey={turnstileSiteKey}
        />,
        400
      );
    }
  }

  try {
    const user = await db?.query.users.findFirst({
      where: withNotDeleted(users, or(
        eq(users.username, identifier),
        eq(users.email, identifier)
      )),
    });

    if (!user) {
      return c.html(
        <LoginPage
          title="Login"
          action="/account/login"
          csrfToken="dummy-csrf-token"
          error="User not found. Please register first."
          identifier={identifier}
          showRegisterLink={true}
          turnstileSiteKey={turnstileSiteKey}
        />,
        400
      );
    }

    if (!(await verifyPasswordFn(user.passwordHash, password))) {
      return c.html(
        <LoginPage
          title="Login"
          action="/account/login"
          csrfToken="dummy-csrf-token"
          error="Invalid password. Please try again."
          identifier={identifier}
          turnstileSiteKey={turnstileSiteKey}
        />,
        400
      );
    }

    const sessionId = nanoid();
    
    const expiresAt = remember 
      ? dayjs().add(30, 'day').toDate()
      : dayjs().add(1, 'day').toDate();
    
    const maxAge = remember 
      ? 30 * 24 * 60 * 60
      : 24 * 60 * 60;

    await db?.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt,
    });

    setCookie(c, 'sessionId', sessionId, {
      path: '/',
      httpOnly: true,
      maxAge: maxAge,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return c.redirect('/account/setting');
  } catch (e) {
    logger.error(`Login failed: ${e}`);
    return c.html(
      <LoginPage
        title="Login"
        action="/account/login"
        csrfToken="dummy-csrf-token"
        error="Login failed. Please try again."
        identifier={identifier}
        turnstileSiteKey={turnstileSiteKey}
      />,
      500
    );
  }
});
