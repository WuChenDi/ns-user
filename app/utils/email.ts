import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev',
      to,
      subject,
      html,
    });

    if (error) {
      logger.error('Failed to send email:', error);
      return false;
    }

    logger.info('Email sent successfully:', data);
    return true;
  } catch (error) {
    logger.error('Email service error:', error);
    return false;
  }
}

export function generateEmailVerificationTemplate(verificationUrl: string, username: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { 
          display: inline-block; 
          background: #007bff; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <h2>Hello ${username}!</h2>
          <p>Thank you for adding your email address. Please click the button below to verify your email:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email</a>
          </p>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This verification link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generatePasswordResetTemplate(resetUrl: string, username: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { 
          display: inline-block; 
          background: #dc3545; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hello ${username}!</h2>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This reset link will expire in 1 hour.</p>
        </div>
        <div class="footer">
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateTwoFactorTemplate(code: string, username: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Two-Factor Authentication</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .code { 
          font-size: 32px; 
          font-weight: bold; 
          text-align: center; 
          background: white; 
          padding: 20px; 
          border-radius: 10px; 
          letter-spacing: 5px; 
          margin: 20px 0; 
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verification Code</h1>
        </div>
        <div class="content">
          <h2>Hello ${username}!</h2>
          <p>Your verification code is:</p>
          <div class="code">${code}</div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please contact support immediately.</p>
        </div>
        <div class="footer">
          <p>For security reasons, never share this code with anyone.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
