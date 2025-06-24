import type { Context } from 'hono';
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { useDrizzle } from '@/db';
import { userGroups, users, sessions } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { withNotDeleted, softDelete } from '@/utils/db';
import { AdminPage } from '@/pages/AdminPage';

interface Variables {
  user: {
    id: number;
    username: string;
    userGroup: string;
    userGroupId: number;
    email: string | null;
    emailVerified: boolean;
  }
};

export interface UserWithGroup {
  id: number;
  username: string;
  email: string | null;
  emailVerified: boolean;
  userGroupId: number;
  groupName: string;
  createdAt: Date;
};

interface UserGroup {
  id: number;
  name: string;
};

interface AuthUser {
  id: number;
  username: string;
  userGroup: string | null;
  userGroupId: number;
  email: string | null;
  emailVerified: boolean | null;
};

interface AuthOptions {
  requiredGroup: string;
}

export const adminRoute = new Hono<{ Variables: Variables }>();

const authMiddleware = ({ requiredGroup }: AuthOptions) => {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const sessionId = getCookie(c, 'sessionId');
      if (!sessionId) {
        logger.warn('Unauthorized access attempt: No sessionId');
        return c.html(
          <AdminPage
            userGroup="Unknown"
            error="Please log in to access the admin panel"
            csrfToken="dummy-csrf-token"
          />,
          401
        );
      }

      const db = useDrizzle(c);
      const session = await db?.query.sessions.findFirst({
        where: withNotDeleted(sessions, eq(sessions.id, sessionId)),
      });

      if (!session) {
        logger.warn('Unauthorized access attempt: Invalid sessionId');
        return c.html(
          <AdminPage
            userGroup="Unknown"
            error="Invalid session. Please log in again."
            csrfToken="dummy-csrf-token"
          />,
          401
        );
      }

      const user = await db
        // @ts-ignore
        ?.select({
          id: users.id,
          username: users.username,
          userGroup: userGroups.displayName,
          userGroupId: users.userGroupId,
          email: users.email,
          emailVerified: users.emailVerified,
        })
        .from(users)
        .leftJoin(userGroups, eq(users.userGroupId, userGroups.id))
        .where(
          and(
            withNotDeleted(users, eq(users.isDeleted, 0)),
            eq(users.id, session.userId)
          )
        )
        .limit(1) as Array<AuthUser> | undefined;

      logger.info(JSON.stringify(user, null, 2))

      if (!user?.length) {
        logger.warn('Unauthorized access attempt: User not found');
        return c.html(
          <AdminPage
            userGroup="Unknown"
            error="User not found. Please log in again."
            csrfToken="dummy-csrf-token"
          />,
          401
        );
      }

      if (user[0]?.userGroup !== requiredGroup) {
        logger.warn(`Unauthorized access attempt by user ${user[0]?.username} with group ${user[0]?.userGroup}`);
        return c.html(
          <AdminPage
            userGroup={user[0]?.userGroup || 'Unknown'}
            error="You do not have permission to access this panel."
            csrfToken="dummy-csrf-token"
          />,
          403
        );
      }

      c.set('user', {
        id: user[0].id,
        username: user[0].username,
        userGroup: user[0]?.userGroup,
        userGroupId: user[0].userGroupId,
        email: user[0].email,
        emailVerified: user[0].emailVerified,
      });

      logger.info(`Authorized access by user ${user[0].username} with group ${user[0]?.userGroup}`);
      await next();
    } catch (error) {
      logger.error('Authentication middleware error:', error);
      return c.html(
        <AdminPage
          userGroup="Unknown"
          error="An error occurred during authentication. Please try again."
          csrfToken="dummy-csrf-token"
        />,
        500
      );
    }
  };
};

adminRoute.use('/*', authMiddleware({ requiredGroup: 'Administrator' }));

const updateUserGroupSchema = z.object({
  userId: z.number(),
  userGroupId: z.number(),
  _csrf: z.string(),
});

const deleteUserSchema = z.object({
  userId: z.number(),
  _method: z.literal('DELETE'),
  _csrf: z.string(),
});

adminRoute.get('/', async (c) => {
  const db = useDrizzle(c);
  const user = c.get('user');

  try {
    const allUsers = await db
      // @ts-ignore
      ?.select({
        id: users.id,
        username: users.username,
        email: users.email,
        emailVerified: users.emailVerified,
        userGroupId: users.userGroupId,
        groupName: userGroups.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(userGroups, eq(users.userGroupId, userGroups.id))
      .where(withNotDeleted(users)) as Array<UserWithGroup> | undefined;

    const groups = await db
      // @ts-ignore
      ?.select({
        id: userGroups.id,
        name: userGroups.displayName,
      })
      .from(userGroups) as Array<UserGroup> | undefined;

    logger.info('Admin fetched user list for management page');

    return c.html(
      <AdminPage
        users={allUsers || []}
        userGroups={groups || []}
        userGroup={user.userGroup || 'Unknown'}
        csrfToken="dummy-csrf-token"
      />
    );
  } catch (error) {
    logger.error('Failed to render admin page:', error);
    return c.html(
      <AdminPage
        userGroup={user.userGroup || 'Unknown'}
        error="Failed to load users. Please try again."
        csrfToken="dummy-csrf-token"
      />,
      500
    );
  }
});

adminRoute.post(
  '/group',
  zValidator('form', updateUserGroupSchema),
  async (c) => {
    const db = useDrizzle(c);
    const user = c.get('user');
    const { userId, userGroupId } = c.req.valid('form');

    try {
      const targetUser = await db?.query.users.findFirst({
        where: withNotDeleted(users, eq(users.id, userId)),
      });

      if (!targetUser) {
        return c.html(
          <AdminPage
            userGroup={user.userGroup || 'Unknown'}
            error="User not found."
            csrfToken="dummy-csrf-token"
          />,
          404
        );
      }

      const group = await db
        ?.select()
        .from(userGroups)
        .where(eq(userGroups.id, userGroupId))
        .limit(1);

      if (!group?.length) {
        return c.html(
          <AdminPage
            userGroup={user.userGroup || 'Unknown'}
            error="User group not found."
            csrfToken="dummy-csrf-token"
          />,
          404
        );
      }

      await db
        ?.update(users)
        .set({ userGroupId, updatedAt: new Date() })
        .where(eq(users.id, userId));

      logger.info(`Updated user ${userId} to group ${userGroupId}`);

      const allUsers = await db
        // @ts-ignore
        ?.select({
          id: users.id,
          username: users.username,
          email: users.email,
          emailVerified: users.emailVerified,
          userGroupId: users.userGroupId,
          groupName: userGroups.name,
          createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(userGroups, eq(users.userGroupId, userGroups.id))
        .where(withNotDeleted(users)) as Array<UserWithGroup> | undefined;

      const groups = await db
        // @ts-ignore
        ?.select({
          id: userGroups.id,
          name: userGroups.displayName,
        })
        .from(userGroups) as Array<UserGroup> | undefined;

      return c.html(
        <AdminPage
          users={allUsers || []}
          userGroups={groups || []}
          userGroup={user.userGroup || 'Unknown'}
          csrfToken="dummy-csrf-token"
          success="User group updated successfully."
        />
      );
    } catch (error) {
      logger.error('Failed to update user group:', error);
      return c.html(
        <AdminPage
          userGroup={user.userGroup || 'Unknown'}
          error="Failed to update user group. Please try again."
          csrfToken="dummy-csrf-token"
        />,
        500
      );
    }
});

adminRoute.post(
  '/',
  zValidator('form', deleteUserSchema),
  async (c) => {
    const db = useDrizzle(c);
    const user = c.get('user');
    const { userId } = c.req.valid('form');

    try {
      const targetUser = await db?.query.users.findFirst({
        where: withNotDeleted(users, eq(users.id, userId)),
      });

      if (!targetUser) {
        return c.html(
          <AdminPage
            userGroup={user.userGroup || 'Unknown'}
            error="User not found."
            csrfToken="dummy-csrf-token"
          />,
          404
        );
      }

      const adminGroup = await db
        ?.select()
        .from(userGroups)
        .where(eq(userGroups.name, 'Administrator'))
        .limit(1);

      if (targetUser.userGroupId === adminGroup?.[0]?.id) {
        return c.html(
          <AdminPage
            userGroup={user.userGroup || 'Unknown'}
            error="Cannot delete admin users."
            csrfToken="dummy-csrf-token"
          />,
          403
        );
      }

      await db
        ?.update(users)
        .set(softDelete())
        .where(eq(users.id, userId));

      logger.info(`Soft deleted user ${userId}`);


      const allUsers = await db
        // @ts-ignore
        ?.select({
          id: users.id,
          username: users.username,
          email: users.email,
          emailVerified: users.emailVerified,
          userGroupId: users.userGroupId,
          groupName: userGroups.name,
          createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(userGroups, eq(users.userGroupId, userGroups.id))
        .where(withNotDeleted(users)) as Array<UserWithGroup> | undefined;

      const groups = await db
        // @ts-ignore
        ?.select({
          id: userGroups.id,
          name: userGroups.displayName,
        })
        .from(userGroups) as Array<UserGroup> | undefined;

      return c.html(
        <AdminPage
          users={allUsers || []}
          userGroups={groups || []}
          userGroup={user.userGroup || 'Unknown'}
          csrfToken="dummy-csrf-token"
          success="User deleted successfully."
        />
      );
    } catch (error) {
      logger.error('Failed to delete user:', error);
      return c.html(
        <AdminPage
          userGroup={user.userGroup || 'Unknown'}
          error="Failed to delete user. Please try again."
          csrfToken="dummy-csrf-token"
        />,
        500
      );
    }
});
