import { blob, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

const trackingFields = {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
  isDeleted: integer('is_deleted')
    .notNull()
    .default(0),
};

// User groups table
export const userGroups = sqliteTable('user_groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(), // 'admin', 'user'
  displayName: text('display_name').notNull(), // 'Administrator', 'Regular User'
  description: text('description'),
  ...trackingFields,
}, (table) => [
  uniqueIndex('user_group_name_idx').on(table.name),
]);

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email'),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false), // Email verification status
  passwordHash: text('password_hash').notNull(),
  userGroupId: integer('user_group_id').notNull().references(() => userGroups.id).default(2), // Default to regular user group
  ...trackingFields,
}, (table) => [
  uniqueIndex('username_idx').on(table.username),
]);

export const userDetails = sqliteTable('user_details', {
  userId: integer('user_id').primaryKey().references(() => users.id),
  nickname: text('nickname'),
  phone: text('phone'),
  ...trackingFields,
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ...trackingFields,
});

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  token: text('token').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ...trackingFields,
});

// Email verification tokens
export const emailVerificationTokens = sqliteTable('email_verification_tokens', {
  token: text('token').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  email: text('email').notNull(), // The email to be verified
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ...trackingFields,
});

// Two-factor authentication tokens
export const twoFactorTokens = sqliteTable('two_factor_tokens', {
  token: text('token').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type', { enum: ['login', 'sensitive_action'] }).notNull(), // Token type
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  used: integer('used', { mode: 'boolean' }).default(false),
  ...trackingFields,
});

// Relations
export const userGroupsRelations = relations(userGroups, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  userGroup: one(userGroups, {
    fields: [users.userGroupId],
    references: [userGroups.id],
  }),
  sessions: many(sessions),
  passwordResetTokens: many(passwordResetTokens),
  emailVerificationTokens: many(emailVerificationTokens),
  twoFactorTokens: many(twoFactorTokens),
  userDetails: many(userDetails),
}));

export const userDetailsRelations = relations(userDetails, ({ one }) => ({
  user: one(users, {
    fields: [userDetails.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [emailVerificationTokens.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const twoFactorTokensRelations = relations(twoFactorTokens, ({ one }) => ({
  user: one(users, {
    fields: [twoFactorTokens.userId],
    references: [users.id],
  }),
}));
