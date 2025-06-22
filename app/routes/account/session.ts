import { Hono } from 'hono';

export const sessionRoute = new Hono();

sessionRoute.get('/', async c => {
  return c.text('session page (hydra removed)');
});
