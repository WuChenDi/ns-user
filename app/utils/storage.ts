
/**
 * Retrieves data from storage by key, with optional sub-key access.
 *
 * @param key - The primary storage key to retrieve data from
 * @param subKey - Optional sub-key to access nested data within the retrieved object
 * @returns Promise that resolves to the stored data object, sub-key value, or undefined if not found
 *
 * @example
 * ```typescript
 * // Get entire object
 * const userData = await getStorage('user');
 *
 * // Get specific property
 * const userName = await getStorage('user', 'name');
 * ```
 */

export async function getStorage(
  key: string,
  subKey?: string,
): Promise<Record<string, any> | undefined> {
  const data = (await storage.get(key)) as Record<string, any> | null
  if (!data) return undefined
  return subKey ? data[subKey] : data
}
