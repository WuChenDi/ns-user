import { Hono } from 'hono';
import { useDrizzle } from '@/db';
import { users, passwordResetTokens } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { hashPasswordFn, withNotDeleted, softDelete } from '@/utils';
import dayjs from 'dayjs';
import { ResetPasswordPage } from '@/components/ResetPasswordPage';

export const resetPasswordRoute = new Hono();

resetPasswordRoute.get('/', async (c) => {
  const db = useDrizzle(c);
  const token = c.req.query('token');
  
  if (!token) {
    return c.html(
      <ResetPasswordPage
        title="Reset Password"
        error="Invalid reset link."
      />
    );
  }

  try {
    const resetToken = await db?.query.passwordResetTokens.findFirst({
      where: withNotDeleted(passwordResetTokens, eq(passwordResetTokens.token, token)),
    });

    if (!resetToken) {
      return c.html(
        <ResetPasswordPage
          title="Reset Password"
          error="Invalid or expired reset link."
        />
      );
    }

    if (dayjs(resetToken.expiresAt).isBefore(dayjs())) {
      // Clean up expired token (soft delete)
      await db?.update(passwordResetTokens)
        .set(softDelete())
        .where(eq(passwordResetTokens.token, token));
      
      return c.html(
        <ResetPasswordPage
          title="Reset Password"
          error="Reset link has expired. Please request a new one."
        />
      );
    }

    return c.html(
      <ResetPasswordPage
        title="Reset Password"
        action="/account/reset-password"
        csrfToken="dummy-csrf-token"
        token={token}
      />
    );

  } catch (error) {
    logger.error('Reset password validation error:', error);
    return c.html(
      <ResetPasswordPage
        title="Reset Password"
        error="An error occurred. Please try again."
      />
    );
  }
});

resetPasswordRoute.post('/', async (c) => {
  const db = useDrizzle(c);
  const body = await c.req.parseBody();
  const token = body.token?.toString();
  const password = body.password?.toString();
  const confirmPassword = body.confirmPassword?.toString();

  if (!token || !password || !confirmPassword) {
    return c.html(
      <ResetPasswordPage
        title="Reset Password"
        action="/account/reset-password"
        csrfToken="dummy-csrf-token"
        error="All fields are required"
        token={token!}
      />,
      400
    );
  }

  if (password !== confirmPassword) {
    return c.html(
      <ResetPasswordPage
        title="Reset Password"
        action="/account/reset-password"
        csrfToken="dummy-csrf-token"
        error="Passwords do not match"
        token={token}
      />,
      400
    );
  }

  if (password.length < 6) {
    return c.html(
      <ResetPasswordPage
        title="Reset Password"
        action="/account/reset-password"
        csrfToken="dummy-csrf-token"
        error="Password must be at least 6 characters long"
        token={token}
      />,
      400
    );
  }

  try {
    const resetToken = await db?.query.passwordResetTokens.findFirst({
      where: withNotDeleted(passwordResetTokens, eq(passwordResetTokens.token, token)),
    });

    if (!resetToken) {
      return c.html(
        <ResetPasswordPage
          title="Reset Password"
          error="Invalid or expired reset link."
        />
      );
    }

    if (dayjs(resetToken.expiresAt).isBefore(dayjs())) {
      // Clean up expired token (soft delete)
      await db?.update(passwordResetTokens)
        .set(softDelete())
        .where(eq(passwordResetTokens.token, token));
      
      return c.html(
        <ResetPasswordPage
          title="Reset Password"
          error="Reset link has expired. Please request a new one."
        />
      );
    }

    // Hash new password
    const passwordHash = await hashPasswordFn(password);

    // Update user password
    await db?.update(users).set({
      passwordHash,
      updatedAt: new Date(),
    }).where(eq(users.id, resetToken.userId));

    // Clean up used token (soft delete)
    await db?.update(passwordResetTokens)
      .set(softDelete())
      .where(eq(passwordResetTokens.token, token));

    logger.info(`Password reset successful for user ${resetToken.userId}`);

    return c.redirect(`/account/login?success=${encodeURIComponent('Password reset successful! You can now log in with your new password.')}`);

  } catch (error) {
    logger.error('Password reset error:', error);
    return c.html(
      <ResetPasswordPage
        title="Reset Password"
        action="/account/reset-password"
        csrfToken="dummy-csrf-token"
        error="An error occurred. Please try again."
        token={token}
      />,
      500
    );
  }
});
