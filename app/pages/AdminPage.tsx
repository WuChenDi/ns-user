import type { FC } from 'hono/jsx';
import { Layout } from '@/components/Layout';
import type { UserWithGroup } from '@/routes/admin';

interface AdminPageProps {
  title?: string;
  users?: UserWithGroup[];
  userGroups?: { id: number; name: string }[];
  userGroup?: string;
  csrfToken?: string;
  error?: string;
  success?: string;
}

export const AdminPage: FC<AdminPageProps> = ({
  title = 'User Management',
  users = [],
  userGroups = [],
  userGroup = 'Unknown',
  csrfToken = '',
  error,
  success,
}) => {
  return (
    <Layout title={title}>
      <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">User Management</h2>
          <p class="text-gray-600 mt-2">Manage user accounts and permissions</p>
        </div>

        {error && (
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-green-800 font-medium">{success}</span>
            </div>
          </div>
        )}

        {userGroup === 'Administrator' ? (
          <div>
            {/* <div class="mb-6">
              <h3 class="text-lg font-medium text-gray-900">Users</h3>
              <p class="text-sm text-gray-600">View and manage all registered users</p>
            </div> */}

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email || '-'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <form
                            action="/admin/group"
                            method="POST"
                            class="inline-flex"
                            onsubmit={`return confirm('Change group for ${user.username}?')`}
                          >
                            <input type="hidden" name="_csrf" value={csrfToken} />
                            <input type="hidden" name="userId" value={user.id} />
                            <select
                              name="userGroupId"
                              class="block w-32 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                              onchange="this.form.submit()"
                              value={user.userGroupId}
                            >
                              {userGroups.map((group) => (
                                <option value={group.id} selected={group.id === user.userGroupId}>
                                  {group.name}
                                </option>
                              ))}
                            </select>
                          </form>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                          <form
                            action="/admin"
                            method="POST"
                            class="inline-flex"
                            onsubmit={`return confirm('Delete user ${user.username}?')`}
                          >
                            <input type="hidden" name="_csrf" value={csrfToken} />
                            <input type="hidden" name="_method" value="DELETE" />
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              class="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                              disabled={user.groupName === 'admin'}
                            >
                              Delete
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} class="px-6 py-4 text-center text-sm text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div class="mt-6 text-center">
              <a
                href="/account/setting"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-blue-600 hover:bg-gray-50 transition-colors"
              >
                Back to Settings
              </a>
            </div>
          </div>
        ) : (
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div>
                <h4 class="text-sm font-medium text-yellow-800">Access Denied</h4>
                <p class="text-sm text-yellow-700 mt-1">
                  Only administrators can access this panel. Contact your system administrator for assistance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
