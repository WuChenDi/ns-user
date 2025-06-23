/**
 * Seed script to initialize user groups
 * This script creates the default user groups: 'admin' and 'user'.
 */

import { Hono } from 'hono';
import { userGroups } from '@/database/schema';
import { useDrizzle } from '@/db';

export const installRoute = new Hono();

installRoute.get('/', async (c) => {
  const db = useDrizzle(c);

  try {
    logger.info('Checking if user groups table exists...');

    const existingGroups = await db?.query.userGroups.findMany();
    if (existingGroups && existingGroups.length > 0) {
      logger.info('User groups table already seeded with data');
      return c.json({ message: 'Database already seeded', groups: existingGroups });
    }

    logger.info('Seeding user groups...');

    await db?.insert(userGroups).values([
      {
        id: 1,
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access with administrative privileges',
      },
      {
        id: 2,
        name: 'user',
        displayName: 'Regular User',
        description: 'Standard user with basic access permissions',
      },
    ]).onConflictDoNothing();

    logger.info('User groups seeded successfully');

    return c.json({ message: 'User groups seeded successfully' });
  } catch (error) {
    logger.error('Failed to seed user groups:', error);
    return c.json({ error: 'Failed to seed user groups' }, 500);
  }
});
