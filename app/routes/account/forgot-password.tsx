import { Hono } from 'hono';
import { useDrizzle } from '@/db';
import { users, passwordResetTokens } from '@/database/schema';
import { eq, or } from 'drizzle-orm';
import { sendEmail, generatePasswordResetTemplate, withNotDeleted, softDelete } from '@/utils';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import { mailUrl } from '@/config';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';

export const forgotPasswordRoute = new Hono();

forgotPasswordRoute.get('/', async (c) => {
  return c.html(
    <ForgotPasswordPage
      title="Forgot Password"
      action="/account/forgot-password"
      csrfToken="dummy-csrf-token"
    />
  );
});

forgotPasswordRoute.post('/', async (c) => {
  const db = useDrizzle(c);

  const body = await c.req.parseBody();
  const identifier = body.identifier?.toString(); // Can be username or email

  if (!identifier) {
    return c.html(
      <ForgotPasswordPage
        title="Forgot Password"
        action="/account/forgot-password"
        csrfToken="dummy-csrf-token"
        error="Username or email is required"
      />,
      400
    );
  }

  try {
    // Find user by username or email, excluding soft deleted users
    const user = await db?.query.users.findFirst({
      where: withNotDeleted(users, or(
        eq(users.username, identifier),
        eq(users.email, identifier)
      )),
    });

    // Always show success message for security (don't reveal if user exists)
    const successMessage = 'If an account with that username or email exists, we have sent a password reset link.';

    if (!user) {
      logger.info(`Password reset requested for non-existent user: ${identifier}`);
      return c.html(
        <ForgotPasswordPage
          title="Forgot Password"
          action="/account/forgot-password"
          csrfToken="dummy-csrf-token"
          success={successMessage}
        />
      );
    }

    // Check if user has an email
    if (!user.email) {
      logger.info(`Password reset requested for user without email: ${user.username}`);
      return c.html(
        <ForgotPasswordPage
          title="Forgot Password"
          action="/account/forgot-password"
          csrfToken="dummy-csrf-token"
          success={successMessage}
        />
      );
    }

    // Generate reset token
    const resetToken = nanoid(32);
    const expiresAt = dayjs().add(1, 'hour').toDate(); // 1 hour expiry

    // Clean up any existing reset tokens for this user (soft delete)
    await db?.update(passwordResetTokens)
      .set(softDelete())
      .where(eq(passwordResetTokens.userId, user.id));

    // Create new reset token
    await db?.insert(passwordResetTokens).values({
      token: resetToken,
      userId: user.id,
      expiresAt,
    });

    // Send reset email
    const resetUrl = `${mailUrl}/account/reset-password?token=${resetToken}`;
    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: generatePasswordResetTemplate(resetUrl, user.username),
    });

    if (!emailSent) {
      logger.error(`Failed to send password reset email to ${user.email}`);
      // Still show success message for security
    } else {
      logger.info(`Password reset email sent to ${user.email}`);
    }

    return c.html(
      <ForgotPasswordPage
        title="Forgot Password"
        action="/account/forgot-password"
        csrfToken="dummy-csrf-token"
        success={successMessage}
      />
    );

  } catch (error) {
    logger.error('Forgot password error:', error);
    return c.html(
      <ForgotPasswordPage
        title="Forgot Password"
        action="/account/forgot-password"
        csrfToken="dummy-csrf-token"
        error="An error occurred. Please try again later."
      />,
      500
    );
  }
});
