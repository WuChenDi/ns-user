import { Hono } from 'hono';
import { useDrizzle } from '@/db';
import { users, emailVerificationTokens } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { withNotDeleted, softDelete } from '@/utils';
import dayjs from 'dayjs';
import { VerifyEmailPage } from '@/components/VerifyEmailPage';

export const verifyEmailRoute = new Hono();

verifyEmailRoute.get('/', async (c) => {
  const db = useDrizzle(c);
  const token = c.req.query('token');
  
  if (!token) {
    return c.html(
      <VerifyEmailPage
        title="Email Verification"
        success={false}
        message="Invalid verification link."
      />
    );
  }

  try {
    const verificationToken = await db?.query.emailVerificationTokens.findFirst({
      where: withNotDeleted(emailVerificationTokens, eq(emailVerificationTokens.token, token)),
    });

    if (!verificationToken) {
      return c.html(
        <VerifyEmailPage
          title="Email Verification"
          success={false}
          message="Invalid or expired verification link."
        />
      );
    }

    if (dayjs(verificationToken.expiresAt).isBefore(dayjs())) {
      // Clean up expired token (soft delete)
      await db?.update(emailVerificationTokens)
        .set(softDelete())
        .where(eq(emailVerificationTokens.token, token));
      
      return c.html(
        <VerifyEmailPage
          title="Email Verification"
          success={false}
          message="Verification link has expired. Please request a new one."
        />
      );
    }

    // Update user email and mark as verified
    await db?.update(users).set({
      email: verificationToken.email,
      emailVerified: true,
      updatedAt: new Date(),
    }).where(eq(users.id, verificationToken.userId));

    // Clean up used token (soft delete)
    await db?.update(emailVerificationTokens)
      .set(softDelete())
      .where(eq(emailVerificationTokens.token, token));

    logger.info(`Email verified for user ${verificationToken.userId}: ${verificationToken.email}`);

    return c.html(
      <VerifyEmailPage
        title="Email Verification"
        success={true}
        message="Your email has been successfully verified!"
      />
    );

  } catch (error) {
    logger.error('Email verification error:', error);
    return c.html(
      <VerifyEmailPage
        title="Email Verification"
        success={false}
        message="An error occurred during verification. Please try again."
      />
    );
  }
});
