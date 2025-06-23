import { Hono } from 'hono';
import { hashPasswordFn, withNotDeleted, DEFAULT_USER_GROUP_ID, verifyTurnstileToken, getClientIP } from '@/utils';
import { useDrizzle } from '@/db';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { RegisterPage } from '@/components/RegisterPage';

export const registerRoute = new Hono();

registerRoute.get('/', async (c) => {
  return c.html(
    <RegisterPage
      title="Register"
      action="/account/register"
      csrfToken="dummy-csrf-token"
      turnstileSiteKey={process.env.TURNSTILE_SITE_KEY}
    />
  );
});

registerRoute.post('/', async (c) => {
  const db = useDrizzle(c);
  const body = await c.req.parseBody();
  const username = body.username?.toString();
  const password = body.password?.toString();
  const turnstileToken = body['cf-turnstile-response']?.toString();

  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY;
  const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!username || !password) {
    return c.html(
      <RegisterPage
        title="Register"
        action="/account/register"
        csrfToken="dummy-csrf-token"
        error="Username and password are required"
        turnstileSiteKey={turnstileSiteKey}
      />,
      400
    );
  }

  if (password.length < 6) {
    return c.html(
      <RegisterPage
        title="Register"
        action="/account/register"
        csrfToken="dummy-csrf-token"
        error="Password must be at least 6 characters long"
        turnstileSiteKey={turnstileSiteKey}
      />,
      400
    );
  }

  if (turnstileSiteKey && turnstileSecretKey) {
    if (!turnstileToken) {
      return c.html(
        <RegisterPage
          title="Register"
          action="/account/register"
          csrfToken="dummy-csrf-token"
          error="Please complete the security verification"
          turnstileSiteKey={turnstileSiteKey}
        />,
        400
      );
    }

    const clientIP = getClientIP(c.req.raw);
    const turnstileValid = await verifyTurnstileToken(turnstileToken, clientIP);
    
    if (!turnstileValid) {
      return c.html(
        <RegisterPage
          title="Register"
          action="/account/register"
          csrfToken="dummy-csrf-token"
          error="Security verification failed. Please try again."
          turnstileSiteKey={turnstileSiteKey}
        />,
        400
      );
    }
  }

  try {
    logger.info(`Checking for existing user with username: ${username}`);
    const existingUser = await db?.query.users.findFirst({
      where: withNotDeleted(users, eq(users.username, username)),
    })
    logger.info(`Existing user found: ${existingUser ? 'Yes' : 'No'}`);

    if (existingUser) {
      return c.html(
        <RegisterPage
          title="Register"
          action="/account/register"
          csrfToken="dummy-csrf-token"
          error="Username already exists"
          turnstileSiteKey={turnstileSiteKey}
        />,
        400
      );
    }

    const passwordHash = await hashPasswordFn(password);
    await db?.insert(users).values({
      username,
      passwordHash,
      userGroupId: DEFAULT_USER_GROUP_ID,
    });

    logger.info(`User ${username} registered successfully`);
    // return c.redirect('/account/login');
    return c.redirect(`/account/login?success=${encodeURIComponent('Registration successful! You can now log in with your credentials.')}&identifier=${encodeURIComponent(username)}`);
    
  } catch (e) {
    logger.error('Registration error:', e);
    return c.html(
      <RegisterPage
        title="Register"
        action="/account/register"
        csrfToken="dummy-csrf-token"
        error="Registration failed. Please try again."
        turnstileSiteKey={turnstileSiteKey}
      />,
      500
    );
  }
});
