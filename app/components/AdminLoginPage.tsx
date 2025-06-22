import type { FC } from 'hono/jsx';
import { Layout } from './Layout';

interface AdminLoginPageProps {
  title?: string;
  error?: string;
  csrfToken?: string;
}

export const AdminLoginPage: FC<AdminLoginPageProps> = ({
  title = 'Admin Login',
  error,
  csrfToken = ''
}) => {
  return (
    <Layout title={title}>
      <div class="bg-white shadow-lg rounded-lg p-8">
        <div class="text-center mb-8">
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Admin Login</h2>
          <p class="text-gray-600 mt-2">Access administrative functions</p>
        </div>
        
        {error && (
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <span class="text-red-800 font-medium">{error}</span>
          </div>
        )}
        
        <form class="space-y-6" action="/admin/login" method="POST">
          <input type="hidden" name="_csrf" value={csrfToken} />
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="admin_token">
              Admin Token
            </label>
            <input 
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              type="password" 
              id="admin_token" 
              name="admin_token" 
              placeholder="Enter your admin token" 
              required
            />
          </div>
          
          <div class="flex items-center">
            <input 
              class="h-4 w-4 text-red-600 border-gray-300 rounded" 
              type="checkbox" 
              id="remember" 
              name="remember" 
              value="1"
            />
            <label class="ml-2 block text-sm text-gray-700" for="remember">
              Remember me
            </label>
          </div>
          
          <button 
            class="w-full px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500" 
            type="submit"
          >
            Log In
          </button>
        </form>
      </div>
    </Layout>
  );
};
