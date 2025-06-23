import { Hono } from 'hono';
import { getStorage } from '@/utils';
import { HomePage } from '@/components/HomePage';

export const homeRoute = new Hono();

homeRoute.get('/', async c => {
  const startTime = await getStorage('server', 'startTime');

  return c.html(
    <HomePage
      title="Home - Auth System"
    />
  );
});
