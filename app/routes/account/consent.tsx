import { Hono } from 'hono';

export const consentRoute = new Hono();

consentRoute.get('/', async c => {
  return c.text('Consent page (hydra removed)');
});

consentRoute.post('/', async c => {
  return c.text('Consent submit (hydra removed)');
});
