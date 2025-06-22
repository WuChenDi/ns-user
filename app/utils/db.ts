import { eq, and } from 'drizzle-orm';

/**
 * Helper function to add isDeleted = 0 condition to queries
 */
export function notDeleted<T extends { isDeleted: any }>(table: T) {
  return eq(table.isDeleted, 0);
}

/**
 * Helper function to soft delete a record
 */
export function softDelete() {
  return {
    isDeleted: 1,
    updatedAt: new Date(),
  };
}

/**
 * Combine conditions with not deleted check
 */
export function withNotDeleted<T extends { isDeleted: any }>(table: T, condition?: any) {
  return condition ? and(notDeleted(table), condition) : notDeleted(table);
}
