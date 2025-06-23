import type { Context } from 'hono';
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie'
import { useDrizzle } from '@/db';
import { users, userDetails, sessions, emailVerificationTokens } from '@/database/schema';
import { eq, not, and, isNotNull } from 'drizzle-orm';
import { sendEmail, generateEmailVerificationTemplate, withNotDeleted, softDelete } from '@/utils';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import { mailUrl } from '@/config';
import { SettingsPage } from '@/components/SettingsPage';

type Variables = {
  userId: number
}

export const settingRoute = new Hono<{ Variables: Variables }>()

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

settingRoute.use('/*', authMiddleware);

settingRoute.get('/', async (c) => {
  const db = useDrizzle(c);
  const userId = c.get('userId')
  const success = c.req.query('success');

  if (!userId) {
    return c.redirect('/account/login');
  }

  const user = await db?.query.users.findFirst({
    where: withNotDeleted(users, eq(users.id, userId)),
    with: {
      userGroup: true,
    },
  });
  const details = await db?.query.userDetails.findFirst({
    where: withNotDeleted(userDetails, eq(userDetails.userId, userId)),
  });

  if (!user) {
    return c.redirect('/account/login');
  }

  const successMessage = success === '1' ? 'Settings updated successfully!' : 
                        success === '2' ? 'Verification email sent! Please check your inbox.' : 
                        undefined;

  return c.html(
    <SettingsPage
      title="User Settings"
      action="/account/setting"
      csrfToken="dummy-csrf-token"
      username={user.username}
      email={user.email || ''}
      emailVerified={user.emailVerified || false}
      userGroup={user.userGroup?.displayName || 'Unknown'}
      nickname={details?.nickname || ''}
      phone={details?.phone || ''}
      success={successMessage}
    />
  );
});

settingRoute.post('/', async (c) => {
  const db = useDrizzle(c);
  const userId = c.get('userId')
  const form = await c.req.formData();
  const username = form.get('username')?.toString();
  const email = form.get('email')?.toString();
  const nickname = form.get('nickname')?.toString();
  const phone = form.get('phone')?.toString();

  if (!username) {
    return c.html(
      <SettingsPage
        title="User Settings"
        action="/account/setting"
        csrfToken="dummy-csrf-token"
        error="Username is required"
        username={username || ''}
        email={email || ''}
        nickname={nickname || ''}
        phone={phone || ''}
      />,
      400
    );
  }

  if (!userId) {
    return c.redirect('/account/login');
  }

  try {
    const currentUser = await db?.query.users.findFirst({
      where: withNotDeleted(users, eq(users.id, userId)),
      with: {
        userGroup: true,
      },
    });

    if (!currentUser) {
      return c.redirect('/account/login');
    }

    // Check username uniqueness
    const existingUserByUsername = await db?.query.users.findFirst({
      where: withNotDeleted(users, and(eq(users.username, username), not(eq(users.id, userId)))),
    });

    if (existingUserByUsername) {
      return c.html(
        <SettingsPage
          title="User Settings"
          action="/account/setting"
          csrfToken="dummy-csrf-token"
          error="Username already exists"
          username={username || ''}
          email={email || ''}
          emailVerified={currentUser.emailVerified || false}
          userGroup={currentUser.userGroup?.displayName || 'Unknown'}
          nickname={nickname || ''}
          phone={phone || ''}
        />,
        400
      );
    }

    // Check if email changed
    const emailChanged = email && email.trim() !== '' && email !== currentUser.email;
    
    if (emailChanged) {
      // Check email uniqueness
      const existingUserByEmail = await db?.query.users.findFirst({
        where: withNotDeleted(users, and(
          eq(users.email, email),
          not(eq(users.id, userId)),
          isNotNull(users.email)
        )),
      });

      if (existingUserByEmail) {
        return c.html(
          <SettingsPage
            title="User Settings"
            action="/account/setting"
            csrfToken="dummy-csrf-token"
            error="Email already exists"
            username={username || ''}
            email={email || ''}
            emailVerified={currentUser.emailVerified || false}
            userGroup={currentUser.userGroup?.displayName || 'Unknown'}
            nickname={nickname || ''}
            phone={phone || ''}
          />,
          400
        );
      }

      // If email is new, we need to send verification
      const verificationToken = nanoid(32);
      const expiresAt = dayjs().add(24, 'hour').toDate();

      // Clean up any existing verification tokens for this user (soft delete)
      await db?.update(emailVerificationTokens)
        .set(softDelete())
        .where(eq(emailVerificationTokens.userId, userId));

      // Create new verification token
      await db?.insert(emailVerificationTokens).values({
        token: verificationToken,
        userId,
        email,
        expiresAt,
      });

      // Send verification email using mailUrl
      const verificationUrl = `${mailUrl}/account/verify-email?token=${verificationToken}`;
      const emailSent = await sendEmail({
        to: email,
        subject: 'Verify your email address',
        html: generateEmailVerificationTemplate(verificationUrl, username),
      });

      if (!emailSent) {
        return c.html(
          <SettingsPage
            title="User Settings"
            action="/account/setting"
            csrfToken="dummy-csrf-token"
            error="Failed to send verification email. Please try again."
            username={username || ''}
            email={currentUser.email || ''}
            emailVerified={currentUser.emailVerified || false}
            userGroup={currentUser.userGroup?.displayName || 'Unknown'}
            nickname={nickname || ''}
            phone={phone || ''}
          />,
          500
        );
      }

      // Update only username and other details, email will be updated after verification
      await db?.update(users).set({ 
        username,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));

      await db
        ?.insert(userDetails)
        .values({ userId, nickname, phone })
        .onConflictDoUpdate({
          target: userDetails.userId,
          set: { nickname, phone, updatedAt: new Date() },
        });

      return c.redirect('/account/setting?success=2');
    } else {
      // No email change, just update other fields
      await db?.update(users).set({ 
        username,
        email: email && email.trim() !== '' ? email : null,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));

      await db
        ?.insert(userDetails)
        .values({ userId, nickname, phone })
        .onConflictDoUpdate({
          target: userDetails.userId,
          set: { nickname, phone, updatedAt: new Date() },
        });

      return c.redirect('/account/setting?success=1');
    }

  } catch (e) {
    logger.error('Settings update error:', e);
    return c.html(
      <SettingsPage
        title="User Settings"
        action="/account/setting"
        csrfToken="dummy-csrf-token"
        error="Update failed. Please try again."
        username={username || ''}
        email={email || ''}
        nickname={nickname || ''}
        phone={phone || ''}
      />,
      500
    );
  }
});
