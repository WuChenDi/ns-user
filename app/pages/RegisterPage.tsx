import type { FC } from 'hono/jsx';
import { Layout } from '@/components/Layout';

interface RegisterPageProps {
  title?: string;
  action?: string;
  csrfToken?: string;
  error?: string;
  turnstileSiteKey?: string;
}

export const RegisterPage: FC<RegisterPageProps> = ({
  title = 'Register',
  action = '/account/register',
  csrfToken = '',
  error,
  turnstileSiteKey
}) => {
  return (
    <Layout title={title}>
      <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Create your account</h2>
          <p class="text-gray-600 mt-2">Join us today and get started</p>
        </div>
        
        {error && (
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <span class="text-red-800 font-medium">{error}</span>
          </div>
        )}
        
        <form class="space-y-6" action={action} method="POST" id="registerForm">
          <input type="hidden" name="_csrf" value={csrfToken} />
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="username">
              Username
            </label>
            <input 
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              type="text" 
              id="username" 
              name="username" 
              placeholder="Choose a username" 
              required 
              autocomplete="username"
            />
            <p class="text-xs text-gray-500 mt-1">This will be your unique identifier</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="password">
              Password
            </label>
            <input 
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Create a secure password" 
              required 
              minlength="6" 
              autocomplete="new-password"
            />
            <p class="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
          </div>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="text-sm font-medium text-blue-800">Registration Info</h4>
            <p class="text-sm text-blue-700 mt-1">
              You can add your email address later in settings to enable password reset and other features.
            </p>
          </div>
          
          {turnstileSiteKey && (
            <div class="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" data-size="normal"></div>
          )}
          
          <button 
            class="w-full px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500" 
            type="submit" 
            id="submitBtn"
          >
            Create Account
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <span class="text-gray-600">Already have an account? </span>
          <a class="ml-1 text-blue-600 hover:text-blue-500 font-medium" href="/account/login">
            Sign in here
          </a>
        </div>
      </div>

      {turnstileSiteKey && (
        <>
          <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
          <script dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                const form = document.getElementById('registerForm');
                if (typeof turnstile !== 'undefined') {
                  form.addEventListener('submit', function(e) {
                    const turnstileResponse = document.querySelector('input[name="cf-turnstile-response"]');
                    if (!turnstileResponse || !turnstileResponse.value) {
                      e.preventDefault();
                      alert('Please complete the security verification.');
                      return false;
                    }
                  });
                }
              });
            `
          }} />
        </>
      )}
    </Layout>
  );
};
