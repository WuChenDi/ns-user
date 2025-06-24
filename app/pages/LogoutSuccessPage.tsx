import type { FC } from 'hono/jsx';
import { Layout } from '@/components/Layout';

interface LogoutSuccessPageProps {
  title?: string;
}

export const LogoutSuccessPage: FC<LogoutSuccessPageProps> = ({
  title = 'Logout Successful'
}) => {
  return (
    <Layout title={title}>
      <div class="text-center py-8">
        <div class="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-green-100 mb-6">
          <svg class="h-10 w-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-green-600 mb-4">Logout Successful!</h1>
        <p class="text-lg text-green-700 mb-8">You have been logged out successfully.</p>
        <div class="space-y-4">
          <a class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700" href="/account/login">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            Login Again
          </a>
          <div>
            <a class="text-blue-600 hover:text-blue-500 font-medium" href="/">
              Back to Home
            </a>
          </div>
        </div>
      </div>
      
      {/* Auto redirect after 3 seconds */}
      <script dangerouslySetInnerHTML={{
        __html: `
          setTimeout(function() {
            window.location.href = '/account/login';
          }, 3000);
        `
      }} />
    </Layout>
  );
};
