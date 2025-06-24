import type { FC } from 'hono/jsx';
import { Layout } from '@/components/Layout';

interface ResetPasswordPageProps {
  title?: string;
  action?: string;
  csrfToken?: string;
  error?: string;
  token?: string;
}

export const ResetPasswordPage: FC<ResetPasswordPageProps> = ({
  title = 'Reset Password',
  action = '/account/reset-password',
  csrfToken = '',
  error,
  token
}) => {
  return (
    <Layout title={title}>
      <div class="bg-white shadow-lg rounded-lg p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p class="text-gray-600 mt-2">Enter your new password below</p>
        </div>
        
        {error ? (
          <div class="text-center py-8">
            <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
              <svg class="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-red-800 font-medium text-lg mb-6">{error}</p>
            <a class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700" href="/account/forgot-password">
              Request New Reset Link
            </a>
          </div>
        ) : token ? (
          <form class="space-y-6" action={action} method="POST">
            <input type="hidden" name="_csrf" value={csrfToken} />
            <input type="hidden" name="token" value={token} />
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="password">
                New Password
              </label>
              <input 
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Enter new password" 
                required 
                minlength="6"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="confirmPassword">
                Confirm Password
              </label>
              <input 
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder="Confirm new password" 
                required 
                minlength="6"
              />
            </div>
            
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-800">Password Requirements:</h4>
              <ul class="text-sm text-gray-600 mt-1 list-disc list-inside">
                <li>At least 6 characters long</li>
                <li>Make sure both passwords match</li>
              </ul>
            </div>
            
            <button 
              class="w-full px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500" 
              type="submit"
            >
              Reset Password
            </button>
          </form>
        ) : (
          <div class="text-center py-8">
            <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
              <svg class="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-red-800 font-medium text-lg mb-6">Invalid reset link</p>
            <a class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700" href="/account/forgot-password">
              Request New Reset Link
            </a>
          </div>
        )}
        
        <div class="mt-6 text-center">
          <a class="text-blue-600 hover:text-blue-500 font-medium" href="/account/login">
            Back to Login
          </a>
        </div>
      </div>
    </Layout>
  );
};
