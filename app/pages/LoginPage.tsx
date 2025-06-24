import type { FC } from 'hono/jsx';
import { Layout } from '@/components/Layout';

interface LoginPageProps {
  title?: string;
  action?: string;
  csrfToken?: string;
  success?: string;
  error?: string;
  identifier?: string;
  showRegisterLink?: boolean;
  turnstileSiteKey?: string;
}

export const LoginPage: FC<LoginPageProps> = ({
  title = 'Login',
  action = '/account/login',
  csrfToken = '',
  success,
  error,
  identifier = '',
  showRegisterLink = false,
  turnstileSiteKey
}) => {
  return (
    <Layout title={title}>
      <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Sign in to your account</h2>
          <p class="text-gray-600 mt-2">Please enter your credentials below</p>
        </div>
        
        {success && (
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <span class="text-green-800 font-medium">{success}</span>
          </div>
        )}
        
        {error && (
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <span class="text-red-800 font-medium">{error}</span>
            {showRegisterLink && (
              <div class="mt-2">
                <a class="text-blue-600 hover:text-blue-500 font-medium" href="/account/register">
                  Click here to register
                </a>
              </div>
            )}
          </div>
        )}
        
        <form class="space-y-6" action={action} method="POST" id="loginForm">
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
              placeholder="Enter your username or email" 
              value={identifier} 
              required 
              autocomplete="username"
            />
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
              placeholder="Enter your password" 
              required 
              minlength="6" 
              autocomplete="current-password"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input 
                class="h-4 w-4 text-blue-600 border-gray-300 rounded" 
                type="checkbox" 
                id="remember" 
                name="remember" 
                value="1"
              />
              <label class="ml-2 block text-sm text-gray-700" for="remember">
                Remember me
              </label>
            </div>
            
            <a class="text-sm text-blue-600 hover:text-blue-500 font-medium" href="/account/forgot-password">
              Forgot your password?
            </a>
          </div>
          
          {turnstileSiteKey && (
            <div class="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" data-size="normal"></div>
          )}
          
          <button 
            class="w-full px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500" 
            type="submit" 
            id="submitBtn"
          >
            Sign in
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <span class="text-gray-600">Don't have an account? </span>
          <a class="ml-1 text-blue-600 hover:text-blue-500 font-medium" href="/account/register">
            Register here
          </a>
        </div>
      </div>

      {turnstileSiteKey && (
        <>
          <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
          <script dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                const form = document.getElementById('loginForm');
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
