import type { FC } from 'hono/jsx';
import { Layout } from '@/components/Layout';

interface ForgotPasswordPageProps {
  title?: string;
  action?: string;
  csrfToken?: string;
  success?: string;
  error?: string;
}

export const ForgotPasswordPage: FC<ForgotPasswordPageProps> = ({
  title = 'Forgot Password',
  action = '/account/forgot-password',
  csrfToken = '',
  success,
  error
}) => {
  return (
    <Layout title={title}>
      <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-auto">
        <div class="text-center mb-8">
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-yellow-100 mb-4">
            <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Forgot Password</h2>
          <p class="text-gray-600 mt-2">We'll send you a reset link</p>
        </div>
        
        {success ? (
          <div class="text-center py-8">
            <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <svg class="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-green-800 font-medium text-lg mb-6">{success}</p>
            <a class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700" href="/account/login">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
              </svg>
              Back to Login
            </a>
          </div>
        ) : (
          <>
            {error && (
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <span class="text-red-800 font-medium">{error}</span>
              </div>
            )}
            
            <p class="text-gray-600 mb-6">
              Enter your username or email address and we'll send you a link to reset your password.
            </p>
            
            <form class="space-y-6" action={action} method="POST">
              <input type="hidden" name="_csrf" value={csrfToken} />
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1" for="identifier">
                  Username or Email
                </label>
                <input 
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  type="text" 
                  id="identifier" 
                  name="identifier" 
                  placeholder="Enter username or email" 
                  required
                />
              </div>
              
              <button 
                class="w-full px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500" 
                type="submit"
              >
                <svg class="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Send Reset Link
              </button>
            </form>
            
            <div class="mt-6 text-center space-y-2">
              <a class="block text-blue-600 hover:text-blue-500 font-medium" href="/account/login">
                Back to Login
              </a>
              <div>
                <span class="text-gray-600">Don't have an account? </span>
                <a class="text-blue-600 hover:text-blue-500 font-medium" href="/account/register">
                  Register here
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
