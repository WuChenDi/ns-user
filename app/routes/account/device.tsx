import { Hono } from 'hono';

export const deviceRoute = new Hono();

deviceRoute.get('/', c => {
  const messages = ['Good Morning', 'Good Evening', 'Good Night'];
  return c.json(messages);
});
