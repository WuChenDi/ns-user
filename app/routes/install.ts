/**
 * Seed script to initialize user groups and default admin user
 * This script creates the default user groups: 'admin' and 'user', and a default admin account.
 */

import { Hono } from 'hono';
import { userGroups, users } from '@/database/schema';
import { useDrizzle } from '@/db';
import { hashPasswordFn } from '@/utils';
import { eq } from 'drizzle-orm';

export const installRoute = new Hono();

installRoute.get('/', async (c) => {
  const db = useDrizzle(c);

  try {
    logger.info('Checking database initialization...');

    // Check if user groups exist
    const existingGroups = await db?.query.userGroups.findMany();
    if (existingGroups && existingGroups.length > 0) {
      logger.info('User groups table already seeded with data');
      return c.json({
        message: 'Database already seeded',
        groups: existingGroups,
        adminStatus: 'Admin account already exists'
      });
    }

    logger.info('Seeding user groups and admin account...');

    // Start transaction to ensure atomicity
    await db?.transaction(async (tx) => {
      // Seed user groups
      await tx.insert(userGroups).values([
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

      // Check if admin user already exists
      const existingAdmin = await tx.query.users.findFirst({
        where: eq(users.username, 'admin')
      });

      if (!existingAdmin) {
        // Create admin user with fixed credentials
        const adminPassword = 'admin2025';
        const passwordHash = await hashPasswordFn(adminPassword);

        await tx.insert(users).values({
          username: 'admin',
          passwordHash,
          userGroupId: 1, // Admin group
          email: null,
          emailVerified: false,
        });

        logger.info('Default admin account created with username: admin');
        if (isDebug) {
          logger.info('Default admin password: admin2025');
        }
      }
    });

    const adminInfo = await db?.query.users.findFirst({
      where: eq(users.username, 'admin'),
      columns: {
        id: true,
        username: true,
        userGroupId: true,
        email: true,
        emailVerified: true,
      }
    });

    return c.json({
      message: 'Database seeded successfully',
      admin: {
        username: adminInfo?.username,
        userGroupId: adminInfo?.userGroupId
      }
    });

  } catch (error) {
    logger.error('Failed to seed database:', error);
    return c.json({ error: 'Failed to seed database' }, 500);
  }
});
