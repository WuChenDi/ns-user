import type { FC } from 'hono/jsx';
import { Layout } from './Layout';

interface SettingsPageProps {
  title?: string;
  action?: string;
  csrfToken?: string;
  username?: string;
  email?: string;
  emailVerified?: boolean;
  userGroup?: string;
  nickname?: string;
  phone?: string;
  success?: string;
  error?: string;
}

export const SettingsPage: FC<SettingsPageProps> = ({
  title = 'User Settings',
  action = '/account/setting',
  csrfToken = '',
  username = '',
  email = '',
  emailVerified = false,
  userGroup = 'Unknown',
  nickname = '',
  phone = '',
  success,
  error
}) => {
  return (
    <Layout title={title}>
      <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg mx-auto">
        <div class="text-center mb-8">
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Account Settings</h2>
          <p class="text-gray-600 mt-2">Manage your profile and account preferences</p>
        </div>
        
        {success && (
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-green-800 font-medium">{success}</span>
            </div>
          </div>
        )}
        
        {error && (
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}
        
        <form class="space-y-5" action={action} method="POST">
          <input type="hidden" name="_csrf" value={csrfToken} />
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" for="username">
              Username
            </label>
            <input 
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              type="text" 
              id="username" 
              name="username" 
              value={username} 
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">User Group</label>
            <div class="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
              <span>{userGroup}</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Your account type and permissions level</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" for="email">Email</label>
            <div class="relative">
              <input 
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10" 
                type="email" 
                id="email" 
                name="email" 
                value={email} 
                placeholder="Add your email"
              />
              {email && emailVerified && (
                <div class="absolute right-3 top-2.5">
                  <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              )}
              {email && !emailVerified && (
                <div class="absolute right-3 top-2.5">
                  <svg class="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              )}
            </div>
            {email && (
              <p class={`text-xs mt-1 ${emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                {emailVerified ? '✓ Verified' : '⚠ Not verified - check your email for verification link'}
              </p>
            )}
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" for="nickname">
              Nickname
            </label>
            <input 
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              type="text" 
              id="nickname" 
              name="nickname" 
              value={nickname} 
              placeholder="Your display name"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" for="phone">
              Phone
            </label>
            <input 
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              type="text" 
              id="phone" 
              name="phone" 
              value={phone} 
              placeholder="Your phone number"
            />
          </div>
          
          <button 
            class="w-full px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors" 
            type="submit"
          >
            Update Settings
          </button>
        </form>
        
        {email && !emailVerified && (
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <div class="flex items-start">
              <svg class="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <h4 class="text-sm font-medium text-yellow-800">Warning</h4>
                <p class="text-sm text-yellow-700 mt-1">
                  Your email address is not verified. Some features may be limited until you verify your email.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div class="mt-8 text-center">
          <a 
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors" 
            href="/account/logout"
          >
            Log out
          </a>
        </div>
      </div>
    </Layout>
  );
};
