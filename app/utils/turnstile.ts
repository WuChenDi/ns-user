export interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verify Turnstile token
 */
export async function verifyTurnstileToken(token: string, remoteip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    logger.error('TURNSTILE_SECRET_KEY environment variable is not set');
    return false;
  }

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const result: TurnstileVerifyResponse = await response.json();

    logger.info(`Turnstile verification result: ${JSON.stringify(result, null, 2)}`);
    
    if (!result.success) {
      logger.warn('Turnstile verification failed:', result['error-codes']);
      return false;
    }

    logger.info('Turnstile verification successful');
    return true;
  } catch (error) {
    logger.error('Turnstile verification error:', error);
    return false;
  }
}

/**
 * Get client IP address
 */
export function getClientIP(request: Request): string | undefined {
  // Try to get real IP from various headers
  const headers = [
    'CF-Connecting-IP',
    'X-Forwarded-For',
    'X-Real-IP',
    'X-Client-IP',
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // X-Forwarded-For may contain multiple IPs, take the first one
      const firstIP = value.split(',')[0];
      return firstIP?.trim();
    }
  }

  return undefined;
}
